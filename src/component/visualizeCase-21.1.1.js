import * as d3 from "d3";
import {AUTH_HEADER, getS3UserId} from "../reducer/utils";
import AWS from "aws-sdk";
import {config} from "../util/EnvConfig";
import {awsBuildSignedUrl} from "../util/AwsUtils";

export const visualizeFlow360Case = function(){
    let vis = {"caseId": 0};
    vis.at = function (caseId, domId) {
        var element = document.getElementById(domId);
        if (element) {
            if (vis.caseId != caseId) {
                vis.caseId = caseId;
                vis.images = {};
                if (vis.interval)
                    clearInterval(vis.interval);

                vis.redraw();
                vis.interval = setInterval(vis.redraw, 500);
            }
            element.appendChild(vis.table);
        }
    }

    vis.images = {};

    vis.table = document.createElement("table");

    let tr = document.createElement("tr");
    vis.table.appendChild(tr);
    let td = document.createElement("td");
    tr.appendChild(td)
    vis.zoomButton = document.createElement("button"); 
    td.appendChild(vis.zoomButton);
    td = document.createElement("td");
    tr.appendChild(td)
    vis.phiSlider = document.createElement("input"); 
    td.appendChild(vis.phiSlider);
    td.setAttribute("class", "vistable");
    td = document.createElement("td");
    tr.appendChild(td)
    vis.fieldButton = document.createElement("button"); 
    td.appendChild(vis.fieldButton);

    tr = document.createElement("tr");
    vis.table.appendChild(tr);
    td = document.createElement("td");
    tr.appendChild(td)
    vis.thetaSlider = document.createElement("input"); 
    td.appendChild(vis.thetaSlider);
    td.setAttribute("class", "vistable");
    td = document.createElement("td");
    tr.appendChild(td)
    vis.canvas = document.createElement("canvas"); 
    td.appendChild(vis.canvas);
    td = document.createElement("td");
    tr.appendChild(td)
    vis.fieldSlider = document.createElement("input");
    td.setAttribute("class", "vistable");
    td.appendChild(vis.fieldSlider);

    vis.getImage = function(imgId) {
        let img = vis.images[imgId];
        if (!(img === undefined)) {
            return img;
        } else {
            vis.images[imgId] = new Image();
            let key = `users/${getS3UserId()}/${vis.caseId}/visualize/${imgId}.png`;
            awsBuildSignedUrl(vis.caseId, `visualize/${imgId}.png`, (signedUrl) => {
                if (signedUrl) {
                    let a = document.createElement('a');
                    vis.images[imgId].src = signedUrl;
                } else {
                    //console.log(`visualization file ${imgId} not found.`);
                }
            });
            return vis.images[imgId];
        }
    }

    vis.fields = ["Fv", "Cf", "Cp", "Yp"];

    vis.drawAxes = function(ctx, phi, theta) {
        let dy = [Math.cos(phi * Math.PI / 180),  Math.sin(phi * Math.PI / 180)];
        let dx = [Math.sin(phi * Math.PI / 180), -Math.cos(phi * Math.PI / 180)];
        let dz = [0, Math.sin(theta * Math.PI / 180)];
        dx[1] *= Math.cos(theta * Math.PI / 180);
        dy[1] *= Math.cos(theta * Math.PI / 180);

        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.translate(80, 500);
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(-dx[0]*30, -dx[1]*30);
        ctx.moveTo(0,0);
        ctx.lineTo(-dy[0]*30, -dy[1]*30);
        ctx.moveTo(0,0);
        ctx.lineTo(-dz[0]*30, -dz[1]*30);
        ctx.stroke();

        ctx.font = "18px arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("x",-dx[0]*50-5,-dx[1]*50+6);
        ctx.fillText("y",-dy[0]*50-5,-dy[1]*50+6);
        ctx.fillText("z",-dz[0]*50-5,-dz[1]*50+6);

        ctx.restore();
     }

    vis.redraw = function() {
        let iTheta = vis.thetaSlider.value;
        let phi = vis.phiSlider.value * 15;
        let iField = vis.fieldSlider.value;
        let thetaStr = ["180", "120", "060", "000"][iTheta];
        let phiStr = (phi % 360).toString();
        if (iTheta == 0 || iTheta == 3) {
            phiStr = "000";
        }
        phiStr = "0".repeat(3 - phiStr.length) + phiStr;

        vis.fieldButton.innerHTML = vis.fields[iField];

        let ctx = vis.canvas.getContext("2d");
        let grd = ctx.createLinearGradient(0, 0, 0, 1024);
        grd.addColorStop(0, ["#bbccff", "#99bbff", "#4466cc", "#224466"][iTheta]);
        grd.addColorStop(1, ["#6688cc", "#224499", "#112244", "#001133"][iTheta]);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, vis.canvas.width, vis.canvas.height);
        let dx = vis.zoomed ? vis.dxZoom : 0;
        let dy = vis.zoomed ? vis.dyZoom : 0;

        ctx.save();
        ctx.translate(vis.canvas.width / 2 + dx, vis.canvas.height / 2 + dy);
        ctx.rotate(([180, 0, 0, 180][iTheta] + phi * [-1, 0, 0, 1][iTheta]) * Math.PI / 180);
        let imgId = [vis.fields[iField], vis.zoomed ? "H" : "L", thetaStr, phiStr].join("_");
        let img = vis.getImage(imgId);
        if (img.width != 0) {
            ctx.drawImage(img, -img.width / 2, -img.width / 2, img.width, img.width);
	    }
        ctx.restore();

        vis.drawAxes(ctx, phi, [180, 120, 60, 0][iTheta]);

        img = vis.getImage(vis.fields[iField] + "Legend");
        if (img.width != 0) {
            ctx.drawImage(img, -100, 50, 300, 300);
        }
    }

    vis.redrawWithClick = function() {
        let iTheta = vis.thetaSlider.value;
        let phi = vis.phiSlider.value * 15;
        let iField = (Number(vis.fieldSlider.value) + 1) % vis.fields.length;
        vis.fieldSlider.value = iField;
        let thetaStr = ["180", "120", "060", "000"][iTheta];
        let phiStr = (phi % 360).toString();
        if (iTheta == 0 || iTheta == 3) {
            phiStr = "000";
        }
        phiStr = "0".repeat(3 - phiStr.length) + phiStr;

        vis.fieldButton.innerHTML = vis.fields[iField];

        let ctx = vis.canvas.getContext("2d");
        let grd = ctx.createLinearGradient(0, 0, 0, 1024);
        grd.addColorStop(0, ["#bbccff", "#99bbff", "#4466cc", "#224466"][iTheta]);
        grd.addColorStop(1, ["#6688cc", "#224499", "#112244", "#001133"][iTheta]);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, vis.canvas.width, vis.canvas.height);
        let dx = vis.zoomed ? vis.dxZoom : 0;
        let dy = vis.zoomed ? vis.dyZoom : 0;

        ctx.save();
        ctx.translate(vis.canvas.width / 2 + dx, vis.canvas.height / 2 + dy);
        ctx.rotate(([180, 0, 0, 180][iTheta] + phi * [-1, 0, 0, 1][iTheta]) * Math.PI / 180);
        let imgId = [vis.fields[iField], vis.zoomed ? "H" : "L", thetaStr, phiStr].join("_");
        let img = vis.getImage(imgId);
        if (img.width != 0) {
            ctx.drawImage(img, -img.width / 2, -img.width / 2, img.width, img.width);
        }
        ctx.restore();

        vis.drawAxes(ctx, phi, [180, 120, 60, 0][iTheta]);

        img = vis.getImage(vis.fields[iField] + "Legend");
        if (img.width != 0) {
            ctx.drawImage(img, -100, 50, 300, 300);
        }
    }
    
    vis.zoom = function() {
        vis.zoomed = !vis.zoomed;
        vis.dxZoom = 0;
        vis.dyZoom = 0;
        vis.redraw();
    }
    
    vis.dragStart = function(event) {
        vis.dragging = true;
        vis.dragStart.lastX = event.clientX;
        vis.dragStart.lastY = event.clientY;
    }
    
    vis.dragMove = function(event) {
        if (vis.zoomed && vis.dragging) {
            vis.dxZoom += event.clientX - vis.dragStart.lastX;
            vis.dyZoom += event.clientY - vis.dragStart.lastY;
            vis.dragStart.lastX = event.clientX;
            vis.dragStart.lastY = event.clientY;
            vis.redraw();
        }
    }
    
    vis.dragEnd = function(event) {
        vis.dragging = false;
    }

    vis.zoomButton.setAttribute("class", "magnify");
    vis.zoomButton.onclick = vis.zoom;
    vis.zoomButton.innerHTML = "zoom";

    vis.fieldButton.setAttribute("class", "magnify");
    vis.fieldButton.onclick = vis.redrawWithClick;

    vis.phiSlider.setAttribute("type", "range");
    vis.phiSlider.setAttribute("class", "slider hslider");
    vis.phiSlider.min = 0;
    vis.phiSlider.max = 24
    vis.phiSlider.value = 16;
    vis.phiSlider.oninput = vis.redraw;

    vis.thetaSlider.setAttribute("type", "range");
    vis.thetaSlider.setAttribute('orient','vertical');
    vis.thetaSlider.setAttribute("class", "slider vslider");
    vis.thetaSlider.min = 0;
    vis.thetaSlider.max = 3
    vis.thetaSlider.value = 2;
    vis.thetaSlider.oninput = vis.redraw;

    vis.fieldSlider.setAttribute("type", "range");
    vis.fieldSlider.setAttribute('orient','vertical');
    vis.fieldSlider.setAttribute("class", "slider vslider");
    vis.fieldSlider.min = 0;
    vis.fieldSlider.max = vis.fields.length - 1;
    vis.fieldSlider.value = 0;
    vis.fieldSlider.oninput = vis.redraw;

    vis.canvas.width = 960;
    vis.canvas.height = 600;
    vis.canvas.onmousedown = vis.dragStart;
    vis.canvas.onmousemove = vis.dragMove;
    vis.canvas.onmouseup = vis.dragEnd;
    vis.canvas.onmouseleave = vis.dragEnd;

    vis.zoomed = false;
    vis.dragging = false;
    vis.dxZoom = 0;
    vis.dyZoom = 0;

    return vis;
}();

