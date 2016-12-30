cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad: function () {
        var ctx = this.node.getComponent(cc.Graphics); 
        ctx.moveTo(0,0);
        ctx.lineTo(1080,0);

        ctx.stroke();
    },
    initInfo:function(data)
    {
        
    }
});
