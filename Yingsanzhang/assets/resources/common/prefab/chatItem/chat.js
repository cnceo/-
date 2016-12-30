var GlobalManager = require("GlobalManager");

cc.Class({
    extends: cc.Component,

    properties: {
       NodeHeadPic:cc.Node,
       NodeLeft:cc.Node,
       NodeRight:cc.Node,
       contentMaxWidth:0
    },
    onLoad: function () {

    },
    initInfo:function(accountId,content)
    {
        var curContentLabel = null; 
        if(accountId == GlobalManager.instance.selfData.nAccountID)
        {
            this.node.x = 900;
            curContentLabel = this.NodeLeft.getChildByName("label");
        }else
        {
            this.node.x = 0;
            curContentLabel = this.NodeRight.getChildByName("label");
        }
        curContentLabel.getComponent(cc.Label).overflow = cc.Label.Overflow.NONE;
        curContentLabel.getComponent(cc.Label).string = content;
        if(curContentLabel.width >= this.contentMaxWidth )
        {
            curContentLabel.getComponent(cc.Label).overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            curContentLabel.width = this.contentMaxWidth;
        }
        curContentLabel.parent.width = curContentLabel.width + 60;
    }
});
