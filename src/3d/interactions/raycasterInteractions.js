import * as THREE from 'three';

export class RaycasterInteractions {
  constructor(camera, scene, domElement, { onClick = () => {}, onHover = () => {} } = {}) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.onClick = onClick;
    this.onHover = onHover;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hovered = null;

    domElement.addEventListener('pointermove', this._onMove);
    domElement.addEventListener('click', this._onClick);
  }

  dispose() {
    this.domElement.removeEventListener('pointermove', this._onMove);
    this.domElement.removeEventListener('click', this._onClick);
  }

  _onMove = (e) => {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this._cast();
  };

  _onClick = () => {
    if (this.hovered) this.onClick(this.hovered);
  };

  _cast() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    const first = hits.find(h => h.object.visible);
    if (first) {
      if (this.hovered !== first.object) {
        this.hovered = first.object;
        this.onHover(first.object, first.point);
      }
    } else {
      this.hovered = null;
      this.onHover(null, null);
    }
  }
}
