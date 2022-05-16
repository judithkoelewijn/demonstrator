/* source code for using teleporting */ 

! function (t) {
    function e(n) {
        if (i[n]) return i[n].exports;
        var s = i[n] = {
            exports: {},
            id: n,
            loaded: !1
        };
        return t[n].call(s.exports, s, s.exports, e), s.loaded = !0, s.exports
    }
    var i = {};
    return e.m = t, e.c = i, e.p = "", e(0)
}([function (t, e, i) {
    function n(t) {
        var e = "line" === t.type ? 2 : t.curveNumberPoints;
        return new h(e, t.curveLineWidth)
    }

    function s(t) {
        var e, i, n;
        return i = document.createElement("a-entity"), i.className = "hitEntity", n = document.createElement("a-entity"), n.setAttribute("geometry", {
            primitive: "torus",
            radius: t.hitCylinderRadius,
            radiusTubular: .01
        }), n.setAttribute("rotation", {
            x: 90,
            y: 0,
            z: 0
        }), n.setAttribute("material", {
            shader: "flat",
            color: t.hitCylinderColor,
            side: "double",
            depthTest: !1
        }), i.appendChild(n), e = document.createElement("a-entity"), e.setAttribute("position", {
            x: 0,
            y: t.hitCylinderHeight / 2,
            z: 0
        }), e.setAttribute("geometry", {
            primitive: "cylinder",
            segmentsHeight: 1,
            radius: t.hitCylinderRadius,
            height: t.hitCylinderHeight,
            openEnded: !0
        }), e.setAttribute("material", {
            shader: "flat",
            color: t.hitCylinderColor,
            side: "double",
            src: r,
            transparent: !0,
            depthTest: !1
        }), i.appendChild(e), i
    }

    function o(t) {
        var e, i;
        return e = new THREE.PlaneBufferGeometry(t, t), e.rotateX(-Math.PI / 2), i = new THREE.MeshBasicMaterial({
            color: 16776960
        }), new THREE.Mesh(e, i)
    }
    var r = i(3),
        a = i(1),
        h = i(2);
    if ("undefined" == typeof AFRAME) throw new Error("Component attempted to register before AFRAME was available.");
    Element.prototype.matches || (Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (t) {
        for (var e = (this.document || this.ownerDocument).querySelectorAll(t), i = e.length; --i >= 0 && e.item(i) !== this;);
        return i > -1
    }), AFRAME.registerComponent("teleport-controls", {
        schema: {
            type: {
                default: "parabolic",
                oneOf: ["parabolic", "line"]
            },
            button: {
                default: "trackpad",
                oneOf: ["trackpad", "trigger", "grip", "menu"]
            },
            startEvents: {
                type: "array"
            },
            endEvents: {
                type: "array"
            },
            collisionEntities: {
                default: ""
            },
            hitEntity: {
                type: "selector"
            },
            cameraRig: {
                type: "selector"
            },
            teleportOrigin: {
                type: "selector"
            },
            hitCylinderColor: {
                type: "color",
                default: "#99ff99"
            },
            hitCylinderRadius: {
                default: .25,
                min: 0
            },
            hitCylinderHeight: {
                default: .3,
                min: 0
            },
            interval: {
                default: 0
            },
            maxLength: {
                default: 10,
                min: 0,
                if: {
                    type: ["line"]
                }
            },
            curveNumberPoints: {
                default: 30,
                min: 2,
                if: {
                    type: ["parabolic"]
                }
            },
            curveLineWidth: {
                default: .025
            },
            curveHitColor: {
                type: "color",
                default: "#99ff99"
            },
            curveMissColor: {
                type: "color",
                default: "#ff0000"
            },
            curveShootingSpeed: {
                default: 5,
                min: 0,
                if: {
                    type: ["parabolic"]
                }
            },
            defaultPlaneSize: {
                default: 100
            },
            landingNormal: {
                type: "vec3",
                default: {
                    x: 0,
                    y: 1,
                    z: 0
                }
            },
            landingMaxAngle: {
                default: "45",
                min: 0,
                max: 360
            },
            drawIncrementally: {
                default: !1
            },
            incrementalDrawMs: {
                default: 700
            },
            missOpacity: {
                default: 1
            },
            hitOpacity: {
                default: 1
            }
        },
        init: function () {
            var t, e, i = this.data,
                n = this.el;
            if (this.active = !1, this.obj = n.object3D, this.hitPoint = new THREE.Vector3, this.rigWorldPosition = new THREE.Vector3, this.newRigWorldPosition = new THREE.Vector3, this.teleportEventDetail = {
                    oldPosition: this.rigWorldPosition,
                    newPosition: this.newRigWorldPosition,
                    hitPoint: this.hitPoint
                }, this.hit = !1, this.prevCheckTime = void 0, this.prevHitHeight = 0, this.referenceNormal = new THREE.Vector3, this.curveMissColor = new THREE.Color, this.curveHitColor = new THREE.Color, this.raycaster = new THREE.Raycaster, this.defaultPlane = o(this.data.defaultPlaneSize), this.defaultCollisionMeshes = [this.defaultPlane], t = this.teleportEntity = document.createElement("a-entity"), t.classList.add("teleportRay"), t.setAttribute("visible", !1), n.sceneEl.appendChild(this.teleportEntity), this.onButtonDown = this.onButtonDown.bind(this), this.onButtonUp = this.onButtonUp.bind(this), this.data.startEvents.length && this.data.endEvents.length) {
                for (e = 0; e < this.data.startEvents.length; e++) n.addEventListener(this.data.startEvents[e], this.onButtonDown);
                for (e = 0; e < this.data.endEvents.length; e++) n.addEventListener(this.data.endEvents[e], this.onButtonUp)
            } else n.addEventListener(i.button + "down", this.onButtonDown), n.addEventListener(i.button + "up", this.onButtonUp);
            this.queryCollisionEntities()
        },
        update: function (t) {
            var e = this.data,
                i = AFRAME.utils.diff(e, t);
            this.referenceNormal.copy(e.landingNormal), this.curveMissColor.set(e.curveMissColor), this.curveHitColor.set(e.curveHitColor), (!this.line || "curveLineWidth" in i || "curveNumberPoints" in i || "type" in i) && (this.line = n(e), this.line.material.opacity = this.data.hitOpacity, this.line.material.transparent = this.data.hitOpacity < 1, this.numActivePoints = e.curveNumberPoints, this.teleportEntity.setObject3D("mesh", this.line.mesh)), e.hitEntity ? this.hitEntity = e.hitEntity : (!this.hitEntity || "hitCylinderColor" in i || "hitCylinderHeight" in i || "hitCylinderRadius" in i) && (this.hitEntity && this.hitEntity.parentNode.removeChild(this.hitEntity), this.hitEntity = s(e), this.el.sceneEl.appendChild(this.hitEntity)), this.hitEntity.setAttribute("visible", !1), "collisionEntities" in i && this.queryCollisionEntities()
        },
        remove: function () {
            var t = this.el,
                e = this.hitEntity,
                i = this.teleportEntity;
            e && e.parentNode.removeChild(e), i && i.parentNode.removeChild(i), t.sceneEl.removeEventListener("child-attached", this.childAttachHandler), t.sceneEl.removeEventListener("child-detached", this.childDetachHandler)
        },
        tick: function () {
            var t = new THREE.Vector3,
                e = new THREE.Vector3,
                i = -9.8,
                n = new THREE.Vector3(0, i, 0),
                s = new THREE.Vector3,
                o = new THREE.Vector3,
                r = new THREE.Quaternion,
                h = new THREE.Vector3,
                l = new THREE.Vector3,
                c = new THREE.Vector3,
                d = new THREE.Vector3,
                u = new THREE.Vector3,
                A = 0;
            return function (i, p) {
                if (this.active && (this.data.drawIncrementally && this.redrawLine && (this.redrawLine = !1, A = 0), A += p, this.numActivePoints = this.data.curveNumberPoints * A / this.data.incrementalDrawMs, this.numActivePoints > this.data.curveNumberPoints && (this.numActivePoints = this.data.curveNumberPoints), !(this.prevCheckTime && i - this.prevCheckTime < this.data.interval))) {
                    this.prevCheckTime = i;
                    var E = this.obj.matrixWorld;
                    E.decompose(h, r, l);
                    var y = c.set(0, 0, -1).applyQuaternion(r).normalize();
                    if (this.line.setDirection(u.copy(y)), this.obj.getWorldPosition(t), o.copy(t), this.teleportEntity.setAttribute("visible", !0), this.line.material.color.set(this.curveMissColor), this.line.material.opacity = this.data.missOpacity, this.line.material.transparent = this.data.missOpacity < 1, this.hitEntity.setAttribute("visible", !1), this.hit = !1, "parabolic" === this.data.type) {
                        e.copy(y).multiplyScalar(this.data.curveShootingSpeed), this.lastDrawnIndex = 0;
                        const m = this.data.drawIncrementally ? this.numActivePoints : this.line.numPoints;
                        for (var v = 0; v < m + 1; v++) {
                            var f;
                            f = v == Math.floor(m + 1) ? m / (this.line.numPoints - 1) : v / (this.line.numPoints - 1), a(t, e, n, f, s);
                            var g = d.copy(s).sub(o).normalize();
                            if (this.raycaster.far = g.length(), this.raycaster.set(o, g), this.lastDrawnPoint = s, this.lastDrawnIndex = v, this.checkMeshCollisions(v, s)) break;
                            o.copy(s)
                        }
                        for (var w = this.lastDrawnIndex + 1; w < this.line.numPoints; w++) this.line.setPoint(w, this.lastDrawnPoint)
                    } else "line" === this.data.type && (s.copy(o).add(u.copy(y).multiplyScalar(this.data.maxLength)), this.raycaster.far = this.data.maxLength, this.raycaster.set(t, y), this.line.setPoint(0, t), this.checkMeshCollisions(1, s))
                }
            }
        }(),
        queryCollisionEntities: function () {
            var t, e = this.data,
                i = this.el;
            return e.collisionEntities ? (t = [].slice.call(i.sceneEl.querySelectorAll(e.collisionEntities)), this.collisionEntities = t, this.childAttachHandler = function (i) {
                i.detail.el.matches(e.collisionEntities) && t.push(i.detail.el)
            }, i.sceneEl.addEventListener("child-attached", this.childAttachHandler), this.childDetachHandler = function (i) {
                var n;
                i.detail.el.matches(e.collisionEntities) && (n = t.indexOf(i.detail.el), n !== -1 && t.splice(n, 1))
            }, void i.sceneEl.addEventListener("child-detached", this.childDetachHandler)) : void(this.collisionEntities = [])
        },
        onButtonDown: function () {
            this.active = !0, this.redrawLine = !0
        },
        onButtonUp: function () {
            const t = new THREE.Vector3,
                e = new THREE.Vector3,
                i = [new THREE.Vector3, new THREE.Vector3],
                n = new THREE.Vector3;
            return function (s) {
                if (this.active && (this.active = !1, this.hitEntity.setAttribute("visible", !1), this.teleportEntity.setAttribute("visible", !1), this.hit)) {
                    const o = this.data.cameraRig || this.el.sceneEl.camera.el;
                    o.object3D.getWorldPosition(this.rigWorldPosition), this.newRigWorldPosition.copy(this.hitPoint);
                    const r = this.data.teleportOrigin;
                    if (r && (r.object3D.getWorldPosition(t), this.newRigWorldPosition.sub(t).add(this.rigWorldPosition)), this.newRigWorldPosition.y = this.rigWorldPosition.y + this.hitPoint.y - this.prevHitHeight, this.prevHitHeight = this.hitPoint.y, e.copy(this.newRigWorldPosition), o.object3D.parent && o.object3D.parent.worldToLocal(e), o.setAttribute("position", e), !this.data.cameraRig)
                        for (var a = document.querySelectorAll("a-entity[tracked-controls]"), h = 0; h < a.length; h++) a[h].object3D.getWorldPosition(n), i[h].copy(this.newRigWorldPosition).sub(this.rigWorldPosition).add(n), a[h].setAttribute("position", i[h]);
                    this.el.emit("teleported", this.teleportEventDetail)
                }
            }
        }(),
        checkMeshCollisions: function (t, e) {
            var i;
            this.data.collisionEntities ? (i = this.collisionEntities.map(function (t) {
                return t.getObject3D("mesh")
            }).filter(function (t) {
                return t
            }), i = i.length ? i : this.defaultCollisionMeshes) : i = this.defaultCollisionMeshes;
            var n = this.raycaster.intersectObjects(i, !0);
            if (n.length > 0 && !this.hit && this.isValidNormalsAngle(n[0].face.normal)) {
                var s = n[0].point;
                this.line.material.color.set(this.curveHitColor), this.line.material.opacity = this.data.hitOpacity, this.line.material.transparent = this.data.hitOpacity < 1, this.hitEntity.setAttribute("position", s), this.hitEntity.setAttribute("visible", !0), this.hit = !0, this.hitPoint.copy(n[0].point);
                for (var o = t; o < this.line.numPoints; o++) this.line.setPoint(o, this.hitPoint);
                return !0
            }
            return this.line.setPoint(t, e), !1
        },
        isValidNormalsAngle: function (t) {
            var e = this.referenceNormal.angleTo(t);
            return THREE.Math.RAD2DEG * e <= this.data.landingMaxAngle
        }
    })
}, function (t, e) {
    function i(t, e, i, n) {
        return t + e * n + .5 * i * n * n
    }

    function n(t, e, n, s, o) {
        return o.x = i(t.x, e.x, n.x, s), o.y = i(t.y, e.y, n.y, s), o.z = i(t.z, e.z, n.z, s), o
    }
    t.exports = n
}, function (t, e) {
    var i = function (t, e) {
        this.geometry = new THREE.BufferGeometry, this.vertices = new Float32Array(3 * t * 2), this.uvs = new Float32Array(2 * t * 2), this.width = e, this.geometry.setAttribute("position", new THREE.BufferAttribute(this.vertices, 3).setUsage(!0)), this.material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 16711680
        }), this.mesh = new THREE.Mesh(this.geometry, this.material), this.mesh.frustumCulled = !1, this.mesh.vertices = this.vertices, this.direction = new THREE.Vector3, this.numPoints = t
    };
    i.prototype = {
        setDirection: function (t) {
            var e = new THREE.Vector3(0, 1, 0);
            this.direction.copy(t).cross(e).normalize().multiplyScalar(this.width / 2)
        },
        setWidth: function (t) {
            this.width = t
        },
        setPoint: function () {
            var t = new THREE.Vector3,
                e = new THREE.Vector3;
            return function (i, n) {
                t.copy(n).add(this.direction), e.copy(n).sub(this.direction);
                var s = 6 * i;
                this.vertices[s++] = t.x, this.vertices[s++] = t.y, this.vertices[s++] = t.z, this.vertices[s++] = e.x, this.vertices[s++] = e.y, this.vertices[s++] = e.z, this.geometry.attributes.position.needsUpdate = !0
            }
        }()
    }, t.exports = i
}, function (t, e) {
    t.exports = "url(data:image/png;base64,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)"
}]);