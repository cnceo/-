var ProtocolMessage = require("ProtocolMessage");
var constDef = require("ConstDef");

cc.Class({
    extends: cc.Component,

    properties: 
    {
        // -------[平台数据]---------------------------
        nAccountID: 0,
        sAccountName:"",
        sPassword:"",
        sNickName:"",
        nSex:0,
        nFhead:0,
        sFcustom_head:"",
        nFrmbH:0,
        nFrmb:0,
        nFcharge_rmbH:0,
        nFcharge_rmb:0,
        nFmoneyH:0,
        nFmoney:0,
        nFwalletH:0,
        nFwallet:0,
        sFreal_name:"",
        sFcard_id:"",
	    sFmobile:"",
        sFemail:"",   
	    nFspreader:0,
       
        // -------[令牌数据]---------------------------
        nLogonTS:0,    
        nLogonRand:0,
        sLogonKey:"",
        
        // -- 在登录口连接回调中当前状态，用于决定连接后的动作 
        nLogonConnectStatus:0, 
        nGameConnectStatus:0,
        nChatConnectStatus:0,

        nHeartRspTS:0, // 心跳响应时间戳 

        // -------[全服玩家列表]---------------------------
        players: [],  // -- 房间用户 item={nAccountID / nOffLine / nTeamID / baseInfo={nAccountID/sNickName/nSex/nFhead/sFcustom_head}}
        teams:[],     // -- 房间队伍 item={nTeamID / nStatus / nOpenMode / playerIDs[nPlayerID]}
        battles:[],   // -- 房间战斗 item={nBattleID / TeamIDs[nTeamID]}

        // --------------------------------------
        nLocalServerTimeDiff : 0,      //本地和服务器时间差

        // -------[队伍]---------------------------
        nTeamID : 0,
        nOpenMode:0,
        
        // -------[战斗]---------------------------
        nBattleID:0,
        nBattleStatus:0,     //0 初始化   战斗结束      1 战斗中
        nBattleStatusTS:0,    //战斗状态时间

        // -----[游戏]----------------------------
        games:[],    // --item={gameID/onLineCount},
        nCurGameID:0,

        // ------[聊天]----------------------------
        messages:null,   // 消息 {key = nFid  value ={nType,nSendID,nSendTS,nParam1,nParam2,sTitle,sContent,sAttachment} } 
        relations:null,  // 好友关系 {key=peerId  value=relation}
    },
    onLoad: function () {  
    },
    refreshChatUI:function()
    {
        var curScene = cc.director.getScene();
        var Canvas = curScene.getChildByName("Canvas");
        var main = Canvas.getComponent("main");
        if (main)main.initChatUI(); 
    }
});
