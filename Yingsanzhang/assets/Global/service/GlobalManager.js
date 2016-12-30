var constDef = require("ConstDef");
var messageHandle = require("MessageHandle");
var ProtocolMessage = require("ProtocolMessage");
var HintManager = require("HintManager");
var Utils = require("Utils"); 

var GlobalManager = cc.Class({
    "extends": cc.Component,

    properties: {
        selfData: require("SelfData"),

        confData: require("ConfData"),

        serverData: require("ServerData"),

        audio:require("AudioManager"),

        hint: {
            default:null,
            type: cc.Node
        },
        load:{
            default:null,
            type: cc.Node
        },
        game:{
            default:null,
            type: cc.Node
        },
        vectLogonMsg:[],
        vectGameMsg:[],
        vectChatMsg:[],
    },

    statics: {
        instance: null
    },

    onLoad: function () {
        GlobalManager.instance = this;
        cc.game.addPersistRootNode(this.node);

        GlobalManager.instance.SocketManager = require("USocket");
        GlobalManager.instance.SocketManager.init(this.openHandler, this.messageHandler, this.closeHandler, this.sendFailedHandler, true);

        GlobalManager.instance.schedule(function () 
        {
            // -- 同时最多只能连接 1 个游戏服务器
            if (GlobalManager.instance.SocketManager.IsConnected(constDef.SERVER_URL.game)) 
            {
                let nowTS = Math.floor(new Date().getTime() / 1000);
                if(nowTS - GlobalManager.instance.selfData.nHeartRspTS >= 5)
                {
                    GlobalManager.instance.SocketManager.CloseSocket(constDef.SERVER_URL.game); 
                }
                else
                {
                    var msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_KERNEL, constDef.MESSAGE.HEART, false);
                    GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);
                }               
            }
        }, 1);
        
        GlobalManager.instance.schedule(function () {
            if (GlobalManager.instance.selfData.nBattleID !== 0)
            {
                if (!GlobalManager.instance.SocketManager.IsConnected(constDef.SERVER_URL.game))
                {
                    var curComp = GlobalManager.instance.hint.getComponent("HintManager");    
                    curComp.ShowHint("网络断开，正在重新连接。。。",HintManager.HintMode.NONE_BUTTON);
                    GlobalManager.instance.GetGameController(GlobalManager.instance.selfData.nCurGameID).SendMsg(gameConstDef.CONNECT_CALLBACK_STATUS.HOME_ENTER_ROOM);
                }
            }
        }, 3);

        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_KERNEL, constDef.MESSAGE.HEART_RSP, messageHandle.handler_HEART_RSP);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.CREATE_ACCOUNT_SUCCESS, messageHandle.handler_CREATE_ACCOUNT_SUCCESS);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.CREATE_ACCOUNT_FAILED, messageHandle.handler_CREATE_ACCOUNT_FAILED);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.LOGON_PLATFORM_SUCCESS, messageHandle.handler_LOGON_PLATFORM_SUCCESS);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.LOGON_PLATFORM_FAILED, messageHandle.handler_LOGON_PLATFORM_FAILED);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.UPDATE_ONLINE_COUNT_SUCCESS, messageHandle.handler_UPDATE_ONLINE_COUNT_SUCCESS);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.UPDATE_ONLINE_COUNT_FAILED, messageHandle.handler_UPDATE_ONLINE_COUNT_FAILED);
        //chat相关
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.CHAT_SUCCESS, messageHandle.handler_CHAT_SUCCESS);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.CHAT_FAILED, messageHandle.handler_CHAT_FAILED);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_CHAT_SUCCESS, messageHandle.handler_GET_CHAT_SUCCESS);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_CHAT_FAILED, messageHandle.handler_GET_CHAT_FAILED);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_RELATION_SUCCESS, messageHandle.handler_GET_RELATION_SUCCESS);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_RELATION_FAILED, messageHandle.handler_GET_RELATION_FAILED);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.SET_RELATION_SUCCESS, messageHandle.handler_SET_RELATION_SUCCESS);
        this.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.SET_RELATION_FAILED, messageHandle.handler_SET_RELATION_FAILED);
    },

    RegMsgHandler: function (mainID, subID, func) {
        this.node.on("[0x" + mainID.toString(16) + "][0x" + subID.toString(16) + "]", func);
    },
    openHandler: function (url) 
    { 
        if (url == constDef.SERVER_URL.logon)
        {
            let msg = GlobalManager.instance.vectLogonMsg.shift();

            GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.logon, msg);
        }
        else if(url == constDef.SERVER_URL.chat)
        {
            let msg = GlobalManager.instance.vectChatMsg.shift();

            GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.chat, msg);
        }
        else
        {
            GlobalManager.instance.selfData.nHeartRspTS = Math.floor(new Date().getTime() / 1000);

            let msg = GlobalManager.instance.vectGameMsg.shift();
            GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);
        }
    },
    closeHandler: function (url, errCode) 
    { 
        if(url == constDef.SERVER_URL.logon)
        {
            if (GlobalManager.instance.vectLogonMsg.length > 0) GlobalManager.instance.ConnectLogonServer();
        }
    },
    sendFailedHandler: function(url) {},
    messageHandler: function(mainCmdID, subCmdID, bodyMsg) {
        var strMsgID = "[0x" + mainCmdID.toString(16) + "][0x" + subCmdID.toString(16) + "]";
        GlobalManager.instance.node.emit(strMsgID, { msgBody: bodyMsg, instanceGlobal: GlobalManager.instance });
    },
     // -----------------------------------------
    GetRightTime:function()
    {
        var localTime = Math.floor(new Date().getTime() / 1000);
        return GlobalManager.instance.selfData.nLocalServerTimeDiff + localTime;
    },
     // -----------------------------------------
    GetDayTs:function(now)
    {
        var during = now - (now+constDef.TIME.BEIJING_TIME_MARGIN)%constDef.TIME.DAY_LONG;
        return during;
     },
    // -----------------------------------------
    SaveUserAccountPassword:function()
    {
        cc.sys.localStorage.setItem('accountName', GlobalManager.instance.selfData.sAccountName);
        cc.sys.localStorage.setItem('password', GlobalManager.instance.selfData.sPassword);
    },

    // -----------------------------------------
    GameNodeAddComponent:function(gameId,callback=null)
    {
        var gameInfo =  GlobalManager.instance.confData.getKindBaseInfo(gameId);
        var alias = gameInfo.alias;
        GlobalManager.instance.game.addComponent(alias+"GameController");
        GlobalManager.instance.game.getChildByName("gameData").addComponent(alias+"GameData");
        GlobalManager.instance.game.getComponent(alias+"GameController").gameRegisterMessage();
        if(callback != null)callback();
    },
    //--------------------------------------------------------------------------------------
    GetGameData:function(gameId)
    {
        var gameInfo =  GlobalManager.instance.confData.getKindBaseInfo(gameId);
        var alias = gameInfo.alias;
        var gameData = GlobalManager.instance.game.getChildByName("gameData").getComponent(alias+"GameData");
        return gameData;
    },
    // ======================================================================================
    GetGameController:function(gameId)
    {
       
        var gameInfo =  GlobalManager.instance.confData.getKindBaseInfo(gameId);
        var alias = gameInfo.alias;
        var gameController = GlobalManager.instance.game.getComponent(alias+"GameController");
        return gameController;
    },
    // --------------------------------------------------------------------------------------
    ConnectLogonServer: function() {
        GlobalManager.instance.SocketManager.AddServer(constDef.SERVER_URL.logon);
    },
    // --------------------------------------------------------------------------------------
    ConnectGameServer: function(gameStatus) {
        GlobalManager.instance.selfData.nGameConnectStatus = gameStatus;
        GlobalManager.instance.SocketManager.AddServer(constDef.SERVER_URL.game);
    }, 
    // --------------------------------------------------------------------------------------
    ConnectChatServer: function() {
        GlobalManager.instance.SocketManager.AddServer(constDef.SERVER_URL.chat);
    },
    // --------------------------------------------------------------------------------------
    SendLogonMsg:function(objMsg) 
    {
        GlobalManager.instance.vectLogonMsg.push(objMsg);
        if (!GlobalManager.instance.SocketManager.IsConnected(constDef.SERVER_URL.logon))
        {
            GlobalManager.instance.ConnectLogonServer();
        }
    },
    // --------------------------------------------------------------------------------------
    SendGameMsg:function(objMsg) 
    {
        GlobalManager.instance.vectGameMsg.push(objMsg);

        if (GlobalManager.instance.SocketManager.IsConnected(constDef.SERVER_URL.game))
        {
             let msg = GlobalManager.instance.vectGameMsg.shift();
             GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);
        }else
        {
             GlobalManager.instance.ConnectGameServer();
        }
    },
     // --------------------------------------------------------------------------------------
    SendChatMsg:function(objMsg) 
    {
        GlobalManager.instance.vectChatMsg.push(objMsg);

        if (GlobalManager.instance.SocketManager.IsConnected(constDef.SERVER_URL.chat))
        {
             let msg = GlobalManager.instance.vectChatMsg.shift();
             GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.chat, msg);
        }else
        {
             GlobalManager.instance.ConnectChatServer();
        }
    },
    // --------------------------------------------------------------------------------------
    SendMsg:function(status)
    {
         switch (status)
        {
            case constDef.CONNECT_CALLBACK_STATUS.LOGON_WAIT_LOGON:
            {
                
                let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_PLATFORM,constDef.MESSAGE.LOGON_PLATFORM_REQ,false); 
                ProtocolMessage.AddVectItemString(msg._body_msg, GlobalManager.instance.selfData.sAccountName);
                ProtocolMessage.AddVectItemString(msg._body_msg, Utils.md5Encrypt(GlobalManager.instance.selfData.sPassword));
                ProtocolMessage.AddVectItemInt(msg._body_msg,  GlobalManager.instance.selfData.nCurGameID);
                ProtocolMessage.AddVectItemInt(msg._body_msg,  GlobalManager.instance.selfData.nCurGameID);
                
                GlobalManager.instance.SendLogonMsg(msg);
                break;
            }
            case constDef.CONNECT_CALLBACK_STATUS.LOGON_WAIT_REGISTER:
            {
                let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_PLATFORM,constDef.MESSAGE.CREATE_ACCOUNT_REQ,false); 
                ProtocolMessage.AddVectItemString(msg._body_msg, GlobalManager.instance.selfData.sAccountName);
                ProtocolMessage.AddVectItemString(msg._body_msg, Utils.md5Encrypt(GlobalManager.instance.selfData.sPassword));
                ProtocolMessage.AddVectItemInt(msg._body_msg, 0);
                ProtocolMessage.AddVectItemString(msg._body_msg, "");
                ProtocolMessage.AddVectItemString(msg._body_msg, "");
                ProtocolMessage.AddVectItemInt(msg._body_msg,  GlobalManager.instance.selfData.nCurGameID);
                ProtocolMessage.AddVectItemInt(msg._body_msg,  GlobalManager.instance.selfData.nCurGameID);
                ProtocolMessage.AddVectItemByte(msg._body_msg, 0);
                GlobalManager.instance.SendLogonMsg(msg);
                break;
            }
            case constDef.CONNECT_CALLBACK_STATUS.LOGON_GET_ONLINE_COUNT:
            {
                let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_PLATFORM,constDef.MESSAGE.UPDATE_ONLINE_COUNT_REQ,false);
                ProtocolMessage.AddVectItemInt(msg._body_msg, GlobalManager.instance.selfData.nCurGameID);     // 0表示拉取所有游戏玩家人数
                GlobalManager.instance.SendLogonMsg(msg);
                break;
            }
            //=====================================================
            case constDef.CONNECT_CALLBACK_STATUS.CHAT_WAIT_SET_RELATION:
            {
                let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_PLATFORM,constDef.MESSAGE.GET_CHAT_REQ,false);
                ProtocolMessage.AddVectItemInt(msg._body_msg,GlobalManager.instance.selfData.nAccountID); 

                // 1 - nAccountID 和 nPeerID 互相关注
                // 2 - nAccountID 关注 nPeerID
                // 3 - nAccountID 取消关注 nPeerID
                // 4 - nAccountID 把 nPeerID 拉到黑名单
                // 5 - nAccountID 取消拉黑 nPeerID
                // 6 - nAccountID 和 nPeerID 互相取消关注 
                ProtocolMessage.AddVectItemInt(msg._body_msg,nType);   
                ProtocolMessage.AddVectItemInt(msg._body_msg,GlobalManager.instance.selfData.nPeerID);
                GlobalManager.instance.SendChatMsg(msg);
                break;
            }
        }
    },
});


