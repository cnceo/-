var GlobalManager = require("GlobalManager");
var HintManager = require("HintManager");
var ProtocolMessage = require("ProtocolMessage");
var constDef = require("ConstDef");
var Utils = require("Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        inputAccountName: 
        {
            default: null,
            type: cc.EditBox,
        },
        inputPassword: 
        {
            default: null,
            type: cc.EditBox,
        },  
        inputAccountNameR: 
        {
            default: null,
            type: cc.EditBox,
        },
        inputPasswordR: 
        {
            default: null,
            type: cc.EditBox,
        },
        inputPasswordR1: 
        {
            default: null,
            type: cc.EditBox,
        },
    },

    onLoad: function () 
    {
        
        let accountname = cc.sys.localStorage.getItem("accountName");
        let password = cc.sys.localStorage.getItem("password");

        if (accountname == "") return;
        if (accountname == null) return;
        if (typeof(accountname) == "undefined") return;

        this.inputAccountName.string = accountname;
        this.inputPassword.string = password;
    },

    switchLogonRegister:function()
    {
        var curScene = cc.director.getScene();
        var curNode = cc.find("Canvas/accountPane/switchBtn", curScene);
        if (curNode.getComponent(cc.Label).string == "快速注册")
        {
            curNode.getComponent(cc.Label).string = "返回登录";
            let nodeLogon = this.node.getChildByName("accountPane").getChildByName("logonPane");
            let nodeRegister = this.node.getChildByName("accountPane").getChildByName("registerPane");
            nodeRegister.active = true;
            nodeLogon.active = false;
        }
        else
        {
            curNode.getComponent(cc.Label).string = "快速注册";
            let nodeLogon = this.node.getChildByName("accountPane").getChildByName("logonPane");
            let nodeRegister = this.node.getChildByName("accountPane").getChildByName("registerPane");
            nodeRegister.active = false;
            nodeLogon.active = true;
        }
    },
    logonClick:function()
    {
        if ((this.inputPassword.string==="") || (this.inputAccountName.string===""))
        {
            var curComp = GlobalManager.instance.hint.getComponent("HintManager");    
            curComp.ShowHint("账号或密码不能为空！",HintManager.HintMode.OK_BUTTON); 
            return;
        }
        
        var curComp = GlobalManager.instance.hint.getComponent("HintManager");    
        curComp.ShowHint("正在进入游戏，请稍等...",HintManager.HintMode.NONE_BUTTON); 

        GlobalManager.instance.selfData.sAccountName = this.inputAccountName.string;
        GlobalManager.instance.selfData.sPassword = this.inputPassword.string;

       GlobalManager.instance.SendMsg(constDef.CONNECT_CALLBACK_STATUS.LOGON_WAIT_LOGON);
    },
    registerClick:function()
    {
        if (this.inputPasswordR.string !== this.inputPasswordR1.string) 
        {
            var curComp = GlobalManager.instance.hint.getComponent("HintManager");    
            curComp.ShowHint("两次密码输入不一致，请重新输入！",HintManager.HintMode.OK_BUTTON); 
            return;
        }
        if ((this.inputPasswordR.string==="") || (this.inputAccountNameR.string===""))
        {
            var curComp = GlobalManager.instance.hint.getComponent("HintManager");    
            curComp.ShowHint("账号或密码不能为空！",HintManager.HintMode.OK_BUTTON); 
            return;
        }
        
        var curComp = GlobalManager.instance.hint.getComponent("HintManager");    
        curComp.ShowHint("正在进入游戏，请稍等...",HintManager.HintMode.NONE_BUTTON); 

        GlobalManager.instance.selfData.sAccountName = this.inputAccountNameR.string;
        GlobalManager.instance.selfData.sPassword = this.inputPasswordR.string;
        
        GlobalManager.instance.SendMsg(constDef.CONNECT_CALLBACK_STATUS.LOGON_WAIT_REGISTER);
    },    
});
