var GlobalManager = require("GlobalManager");

cc.Class({
    extends: cc.Component,

    properties: {
        pressedScale: 0.8,
        transDuration: 0.1,

        strSound:"button.mp3",
    },
    onLoad: function () {
        var self = this;
        self.initScale = this.node.scale;
        self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
        function onTouchDown (event) {
            this.stopAllActions();
            this.runAction(self.scaleDownAction);
        }
        function onTouchEnd (event) {

            GlobalManager.instance.audio.playEffect(self.strSound,false);

            this.stopAllActions();
            this.runAction(self.scaleUpAction);
        }
        function onTouchUp (event) {
            this.stopAllActions();
            this.runAction(self.scaleUpAction);
        }
        this.node.on('touchstart', onTouchDown, this.node);
        this.node.on('touchend', onTouchEnd, this.node);
        this.node.on('touchmove', onTouchUp, this.node);
        this.node.on('touchcancel', onTouchUp, this.node);
    }
});
