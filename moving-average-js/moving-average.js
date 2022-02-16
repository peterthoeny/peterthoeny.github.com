// moving-average.js: Moving average algorithms: Classic and balanced SMA, EMA, WMA
// Copyright: 2022, Peter Thoeny, https://github.com/peterthoeny/moving-average-js
// License: MIT

/**
 * Calculate a moving average array from an array of data points
 *
 * @param  {Array}  arr    data points (array of y-values)
 * @param  {String} type   'SMA':   simple moving average,
 *                         'BSMA':  balanced simple moving average,
 *                         'EMA':   exponential moving average,
 *                         'BEMA':  balanced exponential moving average,
 *                         'WMA':   weighted moving average,
 *                         'BWMA':  balanced weighted moving average,
 *                         'Slope': linerar slope
 *                         'BSlope': special case returning extended array with slope used in balanced algorythm
 * @param  {String} size   size of moving array slice to calculate average
 * @return {Array}  maArr  moving average array
 */
function movingAverage(arr, type, size) {
    if(!arr || arr.length < 4) {
        return arr || [];
    }
    if(size > arr.length) {
        size = arr.length;
    }
    let resArr = [];
    let srcArr = arr.map(val => { return Number(val); });
    let srcIdx = 0;
    let srcLength = srcArr.length;
    let isSMA = (/SMA/i.test(type));
    let isWMA = (/WMA/i.test(type));
    let isEMA = (/EMA/i.test(type));
    let isSlope = (/Slope/i.test(type));
    let isBalanced = (/^B/i.test(type));
    let halfSize = 0;
    if(!isBalanced) {
        // classic moving average (financial)
        if(isSMA) {
            srcArr.forEach(function(val, idx) {
                let start = Math.max(0, idx - size + 1);
                let end = Math.min(srcArr.length, idx + 1);
                val = srcArr.slice(start, end).reduce(function(acc, v) {
                    return acc + v;
                }, 0);
                val = val / (end - start);
                resArr.push(val);
            });
        } else if(isWMA) {
            srcArr.forEach(function(val, idx) {
                let start = Math.max(0, idx - size + 1);
                let end = Math.min(srcArr.length, idx + 1);
                let result = srcArr.slice(start, end).reduce(function(acc, v) {
                    acc.i++;
                    acc.v += acc.i * v;
                    acc.d += acc.i;
                    return acc;
                }, { i: 0, v: 0, d: 0});
                val = result.v / result.d;
                resArr.push(val);
            });
        } else if(isEMA) {
            let weight = 2 / (size + 1);
            let prevVal = srcArr[0];
            srcArr.forEach(function(val) {
                val = (val - prevVal) * weight + prevVal;
                resArr.push(val);
                prevVal = val;
            });
        } else if(isSlope) {
            let stats = srcArr.reduce(function(acc, v, idx, arry) {
                if(idx < srcLength) {
                    let next = arry[idx+1];
                    if(next != undefined) {
                        acc.diff += next - v;
                    }
                    acc.sum += v;
                }
                return acc;
            }, { diff: 0, sum: 0 });
            let average = stats.sum / srcLength;
            let slope = stats.diff / (srcLength - 1);
            let val = average - slope * (srcLength + 1) / 2;
            srcArr.forEach(function(v) {
                val += slope;
                resArr.push(val);
            });
        }
    } else {
        // balanced moving average (technical)
        halfSize = Math.floor(size / 2);
        // preparation: calculate slope and average for halfSize width on left and right
        let stats = srcArr.reduce(function(acc, v, idx, arry) {
            if(idx <= halfSize) {
                let next = arry[idx+1];
                if(idx < halfSize && !Number.isNaN(next)) {
                    acc.lDiff += next - v;
                }
                acc.lSum += v;
            }
            if(idx >= srcLength - halfSize - 1) {
                let prev = arry[idx-1];
                if(idx >= srcLength - halfSize && !Number.isNaN(prev)) {
                    acc.rDiff += v - prev;
                }
                acc.rSum += v;
            }
            return acc;
        }, { lDiff: 0, lSum: 0, rDiff: 0, rSum: 0 });
        let lAverage = stats.lSum / (halfSize + 1);
        let lSlope = stats.lDiff / halfSize;
        let rAverage = stats.rSum / (halfSize + 1);
        let rSlope = stats.rDiff / halfSize;
        let lStartVal = lAverage - lSlope * halfSize / 2;
        let rStartVal = rAverage + rSlope * halfSize / 2 + rSlope;
        // preparation: extend srcArr on left and right side
        // extended array is assumed to be the extension of the slope of halfSize window
        let lSlopeArr = [];
        let rSlopeArr = [];
        for(let i = 0; i < halfSize; i++) {
            lSlopeArr.unshift(lStartVal - (i + 1) * lSlope);
            rSlopeArr.push(rStartVal + (i - 0) * rSlope);
        }
        srcArr = lSlopeArr.concat(srcArr, rSlopeArr);
        if(isSMA) {
            srcArr.forEach(function(val, idx) {
                let start = Math.max(0, idx - halfSize);
                let end = Math.min(srcArr.length, idx + halfSize + 1);
                val = srcArr.slice(start, end).reduce(function(acc, v) {
                    return acc + v;
                }, 0);
                val = val / (end - start);
                resArr.push(val);
            });
        } else if(isWMA) {
            srcArr.forEach(function(val, idx) {
                let start = Math.max(0, idx - halfSize + 1);
                let end = Math.min(srcArr.length, idx + 1);
                let result = srcArr.slice(start, end).reduce(function(acc, v) {
                    acc.i++;
                    acc.v += acc.i * v;
                    acc.d += acc.i;
                    return acc;
                }, { i: 0, v: 0, d: 0});
                val = result.v / result.d;
                resArr.push(val);
            });
            srcArr.reverse().forEach(function(val, idx) {
                let start = Math.max(0, idx - halfSize + 1);
                let end = Math.min(srcArr.length, idx + 1);
                let result = srcArr.slice(start, end).reduce(function(acc, v) {
                    acc.i++;
                    acc.v += acc.i * v;
                    acc.d += acc.i;
                    return acc;
                }, { i: 0, v: 0, d: 0});
                val = result.v / result.d;
                let rIdx = srcArr.length - idx - 1;
                resArr[rIdx] = (resArr[rIdx] + val) / 2;
            });
        } else if(isEMA) {
            let weight = 2 / (halfSize + 1);
            let prevVal = srcArr[0];
            srcArr.forEach(function(val) {
                val = (val - prevVal) * weight + prevVal;
                resArr.push(val);
                prevVal = val;
            });
            prevVal = srcArr[srcArr.length-1];
            for(let idx = srcArr.length - 1; idx >= 0; idx--) {
                let val = srcArr[idx];
                val = (val - prevVal) * weight + prevVal;
                resArr[idx] = (resArr[idx] + val) / 2;
                prevVal = val;
            };
        } else if(isSlope) {
            // return expanded slope on left and right, with gap in middle
            for(let i = 0; i <= halfSize; i++) {
                lSlopeArr.push(lStartVal + i * lSlope);
                rSlopeArr.unshift(rStartVal - (i + 1) * rSlope);
            }
            if(srcLength === 2 * halfSize + 1) {
                resArr = lSlopeArr.concat(rSlopeArr.slice(1));
            } else if(srcLength < 2 * halfSize + 1) {
                resArr = lSlopeArr.slice(0, -1).concat(rSlopeArr.slice(1));
            } else {
                let nullArr = [];
                for(let i = 0; i < srcLength - (2 * halfSize) - 2; i++) {
                    nullArr.push(null);
                }
                resArr = lSlopeArr.concat(nullArr, rSlopeArr);
            }
            return resArr;
        }
        resArr = resArr.slice(halfSize).slice(0, srcLength);
    }
    return resArr;
}

// EOF
