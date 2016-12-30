var constDef = require("ConstDef");
var ProtocolMessage = require("ProtocolMessage");

var MessageHandle = {
    // ===========================================================================================================
    handler_HEART_RSP: function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        var index = 0;
        var serverTime = bodyMsg[index++]._int_value;

        var localTime = Math.floor(new Date().getTime() / 1000);
        instanceGlobal.selfData.nLocalServerTimeDiff = serverTime - localTime;

        // 只要连上游戏服务器就一秒发送一次心跳
        // 若连续五秒未收到心跳响应，则断开链接
        // 是否重连，由重连机制判定（战斗中断线，3秒自动重连）
        instanceGlobal.selfData.nHeartRspTS = localTime;
    },
    // ===========================================================================================================
    handler_LOGON_PLATFORM_SUCCESS: function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        var index = 0;
        instanceGlobal.selfData.nAccountID = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.sAccountName = bodyMsg[index++]._str_value;

        instanceGlobal.selfData.nLogonTS = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.nLogonRand = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.sLogonKey = bodyMsg[index++]._str_value;

        instanceGlobal.selfData.sNickName = bodyMsg[index++]._str_value;
        instanceGlobal.selfData.nSex = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.nFhead = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.sFcustom_head = bodyMsg[index++]._str_value;
        instanceGlobal.selfData.nFrmbH = bodyMsg[index++]._int_value;   //  七砖
        instanceGlobal.selfData.nFrmb = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.nFcharge_rmbH = bodyMsg[index++]._int_value;  // 累计充值
        instanceGlobal.selfData.nFcharge_rmb = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.nFmoneyH = bodyMsg[index++]._int_value;   // 七豆
        instanceGlobal.selfData.nFmoney = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.nFwalletH = bodyMsg[index++]._int_value;  // 七币
        instanceGlobal.selfData.nFwallet = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.sFreal_name = bodyMsg[index++]._str_value;
        instanceGlobal.selfData.sFcard_id = bodyMsg[index++]._str_value;
        instanceGlobal.selfData.sFmobile = bodyMsg[index++]._str_value;
        instanceGlobal.selfData.sFemail = bodyMsg[index++]._str_value;
        instanceGlobal.selfData.nFspreader = bodyMsg[index++]._int_value;
     
        var serverTime = instanceGlobal.selfData.nLogonTS; 
        var localTime = Math.floor(new Date().getTime() / 1000);
        instanceGlobal.selfData.nLocalServerTimeDiff = serverTime - localTime;

        instanceGlobal.SaveUserAccountPassword();

        var gameId = 13;
        instanceGlobal.GameNodeAddComponent(gameId,function(){
            instanceGlobal.selfData.nCurGameID = gameId; 
            instanceGlobal.GetGameController(gameId).SendMsg(constDef.CONNECT_CALLBACK_STATUS.LOGON_GET_GAME_INFO);
        });
    },
    // ===========================================================================================================
    handler_CREATE_ACCOUNT_SUCCESS: function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        var index = 0;
        instanceGlobal.selfData.nAccountID = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.sAccountName = bodyMsg[index++]._str_value;
        var nSpreaderID = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.nLogonTS = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.nLogonRand = bodyMsg[index++]._int_value;
        instanceGlobal.selfData.sLogonKey = bodyMsg[index++]._str_value;

        // ...

        var serverTime = instanceGlobal.selfData.nLogonTS; 
        var localTime = Math.floor(new Date().getTime() / 1000);
        instanceGlobal.selfData.nLocalServerTimeDiff = serverTime - localTime;

        instanceGlobal.SaveUserAccountPassword();

        var gameId = 13;
        instanceGlobal.GameNodeAddComponent(gameId,function(){
            instanceGlobal.selfData.nCurGameID = gameId; 
            instanceGlobal.GetGameController(gameId).SendMsg(constDef.CONNECT_CALLBACK_STATUS.LOGON_GET_GAME_INFO);
        });

    },
    // ==========================================================================================================
    handler_LOGON_PLATFORM_FAILED: function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        var index = 0;
        var errorCode = bodyMsg[index]._int_value;
        // ....根据错误码去提示
        var curComp = instanceGlobal.hint.getComponent("HintManager");
        curComp.ShowHint("账号或者密码输入错误！");
    },

    // ===========================================================================================================
    handler_CREATE_ACCOUNT_FAILED: function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        var curComp = instanceGlobal.hint.getComponent("HintManager");
        curComp.ShowHint("创建账号失败！");
    },
    // ===========================================================================================================
    handler_UPDATE_ONLINE_COUNT_SUCCESS:function(event){
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        if( instanceGlobal.selfData.nCurGameID == 0)
        {
            instanceGlobal.selfData.games.length = 0;
            var itemCount = 2;
            var count = (bodyMsg.length-1) / itemCount;

            for(let i=0;i<count;i++)
            {
                var index1 = 0;
                var item = {};
                item.gameID = bodyMsg[1+i*itemCount + index1++]._int_value;
                item.onLineCount = bodyMsg[1+i*itemCount + index1++]._int_value;
                instanceGlobal.selfData.games.push(item);
            }
            var Canvas = cc.director.getScene().getChildByName('Canvas');
            var gameNode = cc.find("body/game",Canvas);
            var gameController = gameNode.getComponent("GameController");
            gameController.updateGamesInfo();
        }else{
            var gameInfo =  instanceGlobal.confData.getKindBaseInfo(instanceGlobal.selfData.nCurGameID);
            var alias = gameInfo.alias;
            var gameData = instanceGlobal.game.getChildByName("gameData").getComponent(alias+"GameData");
            gameData.rooms.length = 0;
            var itemCount = 2;
            var count = (bodyMsg.length-1) / itemCount;

            for(let i=0;i<count;i++)
            {
                var index1 = 0;
                var item = {};
                item.nRoomID = bodyMsg[1+i*itemCount + index1++]._int_value;
                item.onLineCount = bodyMsg[1+i*itemCount + index1++]._int_value;
                gameData.rooms.push(item);
            }
        }
    },
    // ===========================================================================================================
    handler_UPDATE_ONLINE_COUNT_FAILED:function(event){
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ===========================================================================================================
    handler_CHAT_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

    },
    // ===========================================================================================================
     handler_CHAT_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ===========================================================================================================
     handler_GET_CHAT_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        instanceGlobal.selfData.messages = {};
        var messages = instanceGlobal.selfData.messages;

        var index= 0;
        var nAccountID = bodyMsg[index++]._int_value;
        var itemCount = 9;
        var count = (bodyMsg.length-1)/itemCount;
        for(let i=0;i<count;i++)
        {   
            var index1 = 0;
            var nFid = bodyMsg[1+i*itemCount + index1++]._int_value;
            messages[nFid] = {};
            messages[nFid].nType = bodyMsg[1+i*itemCount + index1++]._int_value;
            messages[nFid].nSendID = bodyMsg[1+i*itemCount + index1++]._int_value;
            messages[nFid].nSendTS = bodyMsg[1+i*itemCount + index1++]._int_value;
            messages[nFid].nParam1 = bodyMsg[1+i*itemCount + index1++]._int_value;
            messages[nFid].nParam2 = bodyMsg[1+i*itemCount + index1++]._int_value;
            messages[nFid].sTitle =  bodyMsg[1+i*itemCount + index1++]._str_value;
            messages[nFid].sContent = bodyMsg[1+i*itemCount + index1++]._str_value;
            messages[nFid].sAttachment = bodyMsg[1+i*itemCount + index1++]._str_value;
        }
        instanceGlobal.selfData.refreshChatUI();
    },
    // ===========================================================================================================
     handler_GET_CHAT_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ===========================================================================================================
     handler_GET_RELATION_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        var index= 0;
        var nAccountID = bodyMsg[index++]._int_value;
        var itemCount = 2;
        var count = (bodyMsg.length-1) / itemCount;
        instanceGlobal.selfData.relations = {};
        var relations = instanceGlobal.selfData.relations;
        for(i=0;i<count;i++)
        {
            var index1=0;
            var nPeerID = bodyMsg[1+i*itemCount+index1++]._int_value;
            var nParam  = bodyMsg[1+i*itemCount+index1++]._int_value;
            relations[nPeerID] = {};
            relations[nPeerID] = nParam;
        }
    },
    // ===========================================================================================================
    handler_GET_RELATION_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ===========================================================================================================
      handler_SET_RELATION_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        var index= 0;
        var nAccountID = bodyMsg[index++]._int_value;
        var nType = bodyMsg[index++]._int_value;
        var nPeerID = bodyMsg[index++]._int_value;
    },
    // ===========================================================================================================
    handler_SET_RELATION_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ===========================================================================================================
}
// ===========================================================================================================
module.exports = MessageHandle;


