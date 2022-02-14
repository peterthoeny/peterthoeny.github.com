// demo.js: Demo for moving average: Show chart of classic and balanced SMA, EMA, WMA
// Copyright: Peter Thoeny, https://github.com/peterthoeny/moving-average-js
// License: MIT

let cp = {  // chart properties
    lPad:       30,
    rPad:       10,
    tPad:       10,
    bPad:       10,
    xUseMin:     0,
    yUseMin:     0,
    yUseMax:    10,
    xMin:       -6,
    yMin:       -1,
    yMax:       11,
    // set later:
    xUseMax:    30,
    xMax:       36,
    xOffset:     0,
    cWidth:      0,
    cHeight:     0,
    gWidth:      0,
    gHeight:     0,
    uWidth:      0,
    uHeight:     0,
    lUsePad:     0,
    tUsePad:     0,
    xStep:      10,
    yStep:      10,
};

function drawGraph(arr, size, showSMA, showEMA, showWMA, showSlope) {
    drawGrid(arr.length);
    drawLine(arr, '#ee3333', 'Input');
    let maArr;
    if(showSlope) {
        maArr = movingAverage(arr, 'Slope', size);
        drawLine(maArr, '#ee33ee', 'Slope', true, 2, [4, 4]);
        // draw slopes on left and right, used by balanced moving average
        let halfSize = Math.floor(size / 2);
        maArr = movingAverage(arr, 'BSlope', size);
        drawLine(maArr, '#ff3333', '', false, 1.5, [2, 8], -halfSize);
        let fillColor = 'rgba(255, 225, 225, 0.25)';
        let points = [
            [0, maArr[0]],
            [2 * halfSize, maArr[2 * halfSize]],
            [2 * halfSize, 0],
            [0, 0]
        ];
        drawPolygon(points, fillColor, -halfSize);
        points = [
            [maArr.length - 2 * halfSize - 1, maArr[maArr.length - 2 * halfSize - 1]],
            [maArr.length - 1, maArr[maArr.length - 1]],
            [maArr.length - 1, 0],
            [maArr.length - 2 * halfSize - 1, 0]
        ];
        drawPolygon(points, fillColor, -halfSize);
    }
    if(showSMA) {
        maArr = movingAverage(arr, 'SMA', size);
        drawLine(maArr, '#33ee33', 'SMA', true, 2, [4, 4]);
        maArr = movingAverage(arr, 'BSMA', size);
        drawLine(maArr, '#33ee33', 'BSMA', true, 1.5);
    }
    if(showEMA) {
        maArr = movingAverage(arr, 'EMA', size);
        drawLine(maArr, '#ee9933', 'EMA', true, 2, [4, 4]);
        maArr = movingAverage(arr, 'BEMA', size);
        drawLine(maArr, '#ee9933', 'BEMA', true, 1.5);
    }
    if(showWMA) {
        maArr = movingAverage(arr, 'WMA', size);
        drawLine(maArr, '#3333ee', 'WMA', true, 2, [4, 4]);
        maArr = movingAverage(arr, 'BWMA', size);
        drawLine(maArr, '#3333ee', 'BWMA', true, 1.5);
    }
}

function xTr(x) {
    return cp.lPad + (x + cp.xOffset + cp.xUseMin - cp.xMin) * cp.xStep;
}

function yTr(y) {
    return cp.tPad + (cp.yMax - y) * cp.yStep;
}

function drawLine(arr, color, legend, isSpline, lineWidth, linePattern, xOffset) {
    cp.xOffset = xOffset || 0;
    var canvas = document.getElementById('graphCanvas');
    if(canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.lineWidth = lineWidth || 1;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.setLineDash(linePattern || []);
        ctx.beginPath();
        let firstPoint = true;
        if(isSpline) {
            var pts = arrayToSpline(arr, 0.5);
            ctx.moveTo(xTr(pts[0].x), yTr(pts[0].y));
            for(var i = 1; i < pts.length; i++) {
                ctx.lineTo(xTr(pts[i].x), yTr(pts[i].y));
            }
            if(legend) {
               var lastIdx = pts.length - 1;
                ctx.fillText(legend, xTr(pts[lastIdx].x) + 22, yTr(pts[lastIdx].y) + 4);
            }
        } else if(0 && isSpline) {
            ctx.moveTo(xTr(0), yTr(arr[0]));
            for(var i = 0; i < arr.length-1; i ++) {
                var x_mid = (i + i + 1) / 2;
                var y_mid = (arr[i] + arr[i+1]) / 2;
                var cp_x1 = (x_mid + i) / 2;
                var cp_x2 = (x_mid + i + 1) / 2;
                ctx.quadraticCurveTo(xTr(cp_x1), yTr(arr[i]),   xTr(x_mid), yTr(y_mid));
                ctx.quadraticCurveTo(xTr(cp_x2), yTr(arr[i+1]), xTr(i+1),   yTr(arr[i+1]));
            }
        } else if(0 && isSpline) {
            ctx.moveTo(xTr(0), yTr(arr[0]));
            for(var i = 1; i < arr.length - 2; i++) {
                var xc = (i + i + 1) / 2;
                var yc = (arr[i] + arr[i + 1]) / 2;
                ctx.quadraticCurveTo(xTr(i), yTr(arr[i]), xTr(xc), yTr(yc));
            }
            ctx.quadraticCurveTo(xTr(i), yTr(arr[i]), xTr(i+1), yTr(arr[i+1]));
        } else {
            for(var i = 0; i < arr.length; i++) {
                if(typeof arr[i] === 'number') {
                    if(firstPoint) {
                        ctx.lineWidth = lineWidth || 1;
                        ctx.moveTo(xTr(i), yTr(arr[i]));
                        firstPoint = false;
                    } else {
                        ctx.lineTo(xTr(i), yTr(arr[i]));
                    }
                } else {
                    ctx.stroke();
                    firstPoint = true;
                }
            }
            if(legend) {
                var lastIdx = arr.length - 1;
                ctx.fillText(legend, xTr(lastIdx) + 22, yTr(arr[lastIdx]) + 4);
            }
        }
        ctx.stroke();
    }
}

function drawPolygon(points, color, xOffset) {
    cp.xOffset = xOffset || 0;
    let canvas = document.getElementById('graphCanvas');
    if(canvas.getContext) {
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.lineWidth = 0;
        points.forEach(point => {
            ctx.lineTo(xTr(point[0]), yTr(point[1]));
        });
        ctx.closePath();
        ctx.fill();
    }
}

function drawGrid(arrSize) {
    let canvas = document.getElementById('graphCanvas');
    cp.xUseMax = arrSize - 1;
    cp.xMax = cp.xUseMax + 6;
    cp.cWidth = canvas.clientWidth;
    cp.cHeight = canvas.clientHeight;
    cp.gWidth = cp.cWidth - cp.lPad - cp.rPad;
    cp.gHeight = cp.cHeight - cp.tPad - cp.bPad;
    cp.xStep = cp.gWidth / (cp.xMax - cp.xMin);
    cp.yStep = cp.gHeight / (cp.yMax - cp.yMin);
    cp.lUsePad = cp.lPad + (cp.xUseMin - cp.xMin) * cp.xStep;
    cp.tUsePad = cp.tPad + (cp.yMax - cp.yUseMax) * cp.yStep;
    cp.uWidth = (cp.xUseMax - cp.xUseMin) * cp.xStep;
    cp.uHeight = (cp.yUseMax - cp.yUseMin) * cp.yStep;
    if(canvas.getContext) {
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, cp.cWidth, cp.cHeight);
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(cp.lUsePad, cp.tUsePad, cp.uWidth, cp.uHeight);
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.strokeStyle  = '#666666';
        ctx.strokeRect(cp.lPad, cp.tPad, cp.gWidth, cp.gHeight);
        ctx.strokeStyle  = '#111111';
        ctx.strokeRect(cp.lUsePad, cp.tUsePad, cp.uWidth, cp.uHeight);
        ctx.lineWidth = 0.7;
        ctx.strokeStyle  = '#bbbbbb';
        ctx.font = '14px Sans-Serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333333';
        let yPos = cp.tPad + cp.yMax * cp.yStep + 13;
        for(let x = cp.xMin; x < cp.xMax; x++) {
            let xPos = cp.lPad + (x - cp.xMin) * cp.xStep;
            ctx.beginPath();
            ctx.moveTo(xPos, cp.tPad);
            ctx.lineTo(xPos, cp.tPad + cp.gHeight);
            ctx.stroke();
            ctx.fillText(x, xPos + 7, yPos);
        }
        for(let y = cp.yMin; y <= cp.yMax; y++) {
            let yPos = cp.tPad + (cp.yMax - y) * cp.yStep;
            ctx.beginPath();
            ctx.moveTo(cp.lPad, yPos);
            ctx.lineTo(cp.lPad + cp.gWidth, yPos);
            ctx.stroke();
            ctx.fillText(y, 17, yPos + 6);
        }
    }
}

function arrayToSpline(arr, tension, numOfSegments) {
    var pts = [];
    for(var i = 0; i < arr.length; i++) {
        pts.push(i);
        pts.push(arr[i]);
    }
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    numOfSegments = numOfSegments ? numOfSegments : 16;
    var res = [],
        x, y,               // our x,y coords
        t1x, t2x, t1y, t2y, // tension vectors
        c1, c2, c3, c4,     // cardinal points
        st, t, i;           // steps based on num. of segments
    pts.unshift(pts[1]);    // copy first point and insert at beginning
    pts.unshift(pts[1]);
    pts.push(pts[pts.length - 2]); // copy last point and append
    pts.push(pts[pts.length - 2]);
    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for (i=2; i < (pts.length - 4); i+=2) {
        for (t=0; t <= numOfSegments; t++) {
            // calc tension vectors
            t1x = (pts[i+2] - pts[i-2]) * tension;
            t2x = (pts[i+4] - pts[i]) * tension;
            t1y = (pts[i+3] - pts[i-1]) * tension;
            t2y = (pts[i+5] - pts[i+1]) * tension;
            // calc step
            st = t / numOfSegments;
            // calc cardinals
            c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1; 
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
            c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st; 
            c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);
            // calc x and y cords with common control vectors
            x = c1 * pts[i]    + c2 * pts[i+2] + c3 * t1x + c4 * t2x;
            y = c1 * pts[i+1]  + c2 * pts[i+3] + c3 * t1y + c4 * t2y;
            //store points in array
            res.push({ x: x, y: y });
        }
    }
    return res;
}

// EOF
