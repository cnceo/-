var constDef = require("ConstDef");


var HintManager = cc.Class({
    extends: cc.Component,

    properties: {

        hintCallBack: null,
        
        labelDesc:cc.Label,
        flyNode:cc.Node,
        flyLabel:cc.Label,
        HintFrame:cc.Animation,
        HintFly:cc.Animation,
    },

    statics: {
        HintMode: null
    },

    // use this for initialization
    onLoad: function () {
        
        HintManager.HintMode = cc.Enum({
            SIMPLE_FLY        :0,    // 简单飘窗方式
            NONE_BUTTON       :1,    // 对话框无按钮
            OK_BUTTON         :2,    // 对话框只有确定、取消按钮
            OK_CANCEL_BUTTON  :3     // 对话框有确定、取消按钮
        });

        let hintNode = this.node.getChildByName("HintFrame");
        hintNode.setCascadeOpacityEnabled(false);

        var self = this;
        var loadDir = "common/base/popAnim";
        cc.loader.loadResAll(loadDir, cc.AnimationClip,function (err, assets){
            cc.loader.loadRes(loadDir+"/hint_fly",cc.AnimationClip,function (err, animationClip){ self.HintFly.addClip(animationClip);});
            cc.loader.loadRes(loadDir+"/hint_fly_reset",cc.AnimationClip,function (err, animationClip){ self.HintFly.addClip(animationClip); });
           
            cc.loader.loadRes(loadDir+"/PopHide",cc.AnimationClip,function (err, animationClip){  self.HintFrame.addClip(animationClip);});
            cc.loader.loadRes(loadDir+"/PopHideReset",cc.AnimationClip,function (err, animationClip){ self.HintFrame.addClip(animationClip);});
            cc.loader.loadRes(loadDir+"/PopShow",cc.AnimationClip,function (err, animationClip){ self.HintFrame.addClip(animationClip);});
            cc.loader.loadRes(loadDir+"/PopShowReset",cc.AnimationClip,function (err, animationClip){ self.HintFrame.addClip(animationClip);});
        });
    },
    ShowFly:function(val)
    {
        let curScene = cc.director.getScene();
        let curNode = cc.find("Canvas",curScene);

        this.flyNode.parent = curNode;
        this.flyNode.active = true;
        this.flyLabel.string = val;

        let menuAnim = this.flyNode.getComponent(cc.Animation);
        menuAnim.play('hint_fly_reset'); 
        menuAnim.play('hint_fly');  
    },

    ShowHint:function(val,mode,callback)
    {
        let curScene = cc.director.getScene();
        let curNode = cc.find("Canvas",curScene);
        
        this.node.parent = curNode;
        this.node.x=0;
        this.node.y=0; 
        
        this.hintCallBack = callback;
        this.labelDesc.string = val;
        
        this.flyNode.active = false;
        this.node.active = true;
        
        this.node.on(cc.Node.EventType.MOUSE_DOWN, function (event) { event.stopPropagation(); });
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) { event.stopPropagation(); });
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) { event.stopPropagation(); });
         //是否显示确定按钮   mode ： 1 不显示  
        var confirmButton = cc.find("HintFrame/btn",this.node);
        if(mode == HintManager.HintMode.NONE_BUTTON){
            confirmButton.active = false; 
        }else{
            confirmButton.active = true;
        }
        let menuAnim = this.node.getChildByName("HintFrame").getComponent(cc.Animation);

        menuAnim.play('PopShowReset');
        menuAnim.play('PopShow');
    },
    HideHint:function()
    {
        let menuAnim = this.node.getComponent(cc.Animation);
        menuAnim.play('PopHideReset');
        menuAnim.play('PopHide');   
    },
    OnHideHint:function()
    {
        this.node.active =false;
        
        this.node.parent = null;
        
        if ((this.hintCallBack !== undefined) && (this.hintCallBack !== null))
        {
            this.hintCallBack();
        }
    },
});
