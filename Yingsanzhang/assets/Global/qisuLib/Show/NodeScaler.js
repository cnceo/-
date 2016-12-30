cc.Class({
    extends: cc.Component,

    properties: {
        bigScale: 1.2
    },
    onLoad: function () {
        
    },
    onDestroy:function()
    {
    },
    onEnable:function()
    {
    },
    onDisable:function()
    {
    },
    Show:function()
    {
        if (this.node.active == true) return;
        this.node.scale = 0;
        this.node.active=true;

        var seq = cc.sequence
        (
            cc.scaleTo(0.2, this.bigScale),
            cc.scaleTo(0.2, 1)
        );
        this.node.runAction(seq);
    },
    Hide:function()
    {
        var finished = cc.callFunc(function(target, val) {
            this.node.active = val;
        }, this, false);

        if (this.node.active === false) return;
        this.node.scale = 1;

        var seq = cc.sequence
        (
            cc.scaleTo(0.2, this.bigScale),
            cc.scaleTo(0.2, 0),
            finished
        );
        this.node.runAction(seq);
    },

    ShowA:function()
    {
        this.node.scale = 0;

        var seq = cc.sequence
        (
            cc.scaleTo(0.2, this.bigScale),
            cc.scaleTo(0.2, 1)
        );
        this.node.runAction(seq);
    },
});

