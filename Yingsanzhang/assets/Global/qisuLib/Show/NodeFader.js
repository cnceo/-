cc.Class({
    extends: cc.Component,

    properties: {
        during: 0.5
    },
    GetDuring:function()
    {
        return this.during;
    },
    Show:function(aimNode=null)
    {
        let curNode = aimNode;
        if (aimNode===null) curNode = this.node; 

        if (curNode.active == true) return;
        curNode.opacity = 0;
        curNode.active=true;

        var seq = cc.sequence
        (
            cc.fadeIn(this.during)
        );
        curNode.runAction(seq);
    },
    Hide:function(aimNode=null)
    {
        let curNode = aimNode;
        if (aimNode===null) curNode = this.node; 

        var finished = cc.callFunc(function(target, val) {
            curNode.active = val;
        }, curNode, false);

        if (curNode.active === false) return;
        curNode.opacity = 255;

        var seq = cc.sequence
        (
            cc.fadeOut(this.during),
            finished
        );
        curNode.runAction(seq);
    }
});

