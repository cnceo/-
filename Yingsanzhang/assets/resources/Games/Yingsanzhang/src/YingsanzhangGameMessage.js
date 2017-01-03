var constDef = require("ConstDef");
var ProtocolMessage = require("ProtocolMessage");
var gameConstDef = require("YingsanzhangConstDef");

var GameMessage = {
    // ==========================================================================================================
    handler_GET_GAME_INFO_SUCCESS: function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 5;
        gameData.nFdiamondH = bodyMsg[index++]._int_value;
        gameData.nFdiamondL = bodyMsg[index++]._int_value;
        gameData.nFcoinH = bodyMsg[index++]._int_value;
        gameData.nFcoinL = bodyMsg[index++]._int_value;
               
        if( gameData.nFbeginner_flag > 0)
        {
            var curComp = instanceGlobal.load.getComponent("LoadManager");
            curComp.OpenGame(instanceGlobal.selfData.nCurGameID);
        }else
        {
            var curComp = instanceGlobal.load.getComponent("LoadManager");
            curComp.Show('zhajinhua_guide');
        } 
    },
   
    // ===========================================================================================================
    handler_GET_GAME_INFO_FAILED: function(event) {
        cc.log("handler_GET_GAME_INFO_FAILED");                                                 
        
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },    
    // ==========================================================================================================
    handler_GET_PLAYERS_BASE_INFO_SUCCESS: function(event) {
        cc.log("handler_GET_PLAYERS_BASE_INFO_SUCCESS");                                                 
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        var item = {};
        var nAccountID = bodyMsg[index++]._int_value;
        var teamsList = gameData.vectTeamList;
        var teamsCount = teamsList.length;
        for (var i = 0; i < teamsCount; i++) 
        {
            if(nAccountID === teamsList[i].nAccountID)
            {
                teamsList[i].nick     = bodyMsg[index++]._str_value;
                teamsList[i].nSex          = bodyMsg[index++]._int_value;
                teamsList[i].nFhead        = bodyMsg[index++]._int_value;
                teamsList[i].sFcustom_head = bodyMsg[index++]._int_value;
                let nValH = bodyMsg[index++]._int_value;
                let nValL = bodyMsg[index++]._int_value;
                let nval = bodyMsg[index++]._int_value;
                teamsList[i].nTotalMoney = bodyMsg[index++]._int_value;
                teamsList[i].ncoinH = bodyMsg[index++]._int_value;
                teamsList[i].ncoinL = bodyMsg[index++]._int_value;
                break;
            }
        }
        gameData.RefreshPlayerData();
    },

     // ==========================================================================================================
    handler_GET_PLAYERS_BASE_INFO_FAILED: function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
     // ==========================================================================================================
    handler_GET_TEAM_MEMBERS_SUCCESS:function(event)
    {
        cc.log("handler_GET_TEAM_MEMBERS_SUCCESS");                                                 
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID); 

        for(let i=0;i<bodyMsg.length;i++)
        {
            var vectList = bodyMsg[i]._vect_value;
            var index = 0;
            var nTeamID = vectList[index++]._int_value;
            var nAccountID = vectList[index++]._int_value;  
            var teamList = gameData.vectTeamList;
            for(let j=0;j<teamList.length;j++)
            {
                if(nTeamID == teamList[j].nTeamID)
                {
                    teamList[j].nAccountID = nAccountID;
                    break;
                }
            }
        }
        instanceGlobal.GetGameController(instanceGlobal.selfData.nCurGameID).SendMsg(constDef.CONNECT_CALLBACK_STATUS.LOGON_GET_PLAYERS_BASE_INFO);
    },
    // ========================================================================================================
    handler_GET_TEAM_MEMBERS_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
    },
    // ===========================================================================================================
    handler_GET_MATCH_DATA_NOTIFY:function(event)
    {
        cc.log("handler_GET_MATCH_DATA_NOTIFY");                                         
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        if(bodyMsg.length > 1)      // 未报名只传一个字段   nMatchSignTS=0
        {
            var nMatchSignTS = bodyMsg[index++]._int_value;
            var nMatchFlag = bodyMsg[index++]._int_value;
            var nTeamID = bodyMsg[index++]._int_value;
            var nMatchStatus = bodyMsg[index++]._int_value;
            var nMatchStatusTS = bodyMsg[index++]._int_value;
            var nMatchRemainCount = bodyMsg[index++]._int_value;
            var nMatchRank = bodyMsg[index++]._int_value;
           
            if(nMatchFlag == constDef.MATCH_RESULT.NONE || nTeamID == gameData.nTeamID)
            {   
                gameData.nMatchTS = nMatchSignTS;
                gameData.nMatchFlag = nMatchFlag;
                gameData.nTeamID = nTeamID;
                gameData.nMatchStatus = nMatchStatus;
                gameData.nMatchStatusTS = nMatchStatusTS;
                gameData.nMatchRemainCount = nMatchRemainCount;
                gameData.nMatchRank = nMatchRank;
            }

            if(nMatchFlag >= constDef.MATCH_RESULT.OutAtOnce_OUT && nMatchFlag<= constDef.MATCH_RESULT.FixedRound_WIN)
            {
                gameData.RefreshData();
            }
        }
    },
    // ===========================================================================================================
    handler_GET_MATCH_CUR_COUNT_SUCCESS:function(event){
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        var nMatchTS = bodyMsg[index++]._int_value;
        var nMatchCurSignCount = bodyMsg[index++]._int_value;
        gameData.nMatchCurSignCount = nMatchCurSignCount;
        gameData.RefreshGameWait();
    },
     // ===========================================================================================================
     handler_BALANCE_NOTIFY:function(event)
     {
        cc.log("handler_BALANCE_NOTIFY");                                 
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        if(bodyMsg.length>1)
        {
            var index = 0;
            var nAccountID = bodyMsg[index++]._int_value;
            var nType = bodyMsg[index++]._int_value;
            if(nType == constDef.FIGHT_RESULT.MATCH_REVOKE)    // 比赛解散
            {
                 gameData.nMatchTS = 0;                 
                 gameData.RefreshGameWait();
            }
        }
     },
    // ===========================================================================================================
    handler_ENTER_ROOM_SUCCESS: function(event) {
        cc.log("handler_ENTER_ROOM_SUCCESS");
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        if (instanceGlobal.confData.bHoldPlayersInfo === true)
        {
            var msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_ROOM_PLAYERS_REQ, false);
            instanceGlobal.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);        
        }
        
        gameData.ClearBattleData();
        
        if(bodyMsg.length > 0)
        {
            gameData.InitBattleData(bodyMsg);
            var curComp = instanceGlobal.load.getComponent("LoadManager");
            curComp.Show('Yingsanzhang_war');
        }
        else
        {
            if(gameData.nOpenMode == constDef.BATTLE_OPEN_MODE.MATCH)
            {
                var curComp = instanceGlobal.load.getComponent("LoadManager");
                curComp.Show('Yingsanzhang_gameWait');

            }else
            {
                 let msg2 = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_GAME,constDef.MESSAGE.ENTER_BATTLE_REQ,false); 
                 ProtocolMessage.AddVectItemInt(msg2._body_msg, 0); // 快速加入，桌子ID为0
                 instanceGlobal.SocketManager.SendMessage(constDef.SERVER_URL.game, msg2);
            }
        }
    },
    // ===========================================================================================================
    handler_ENTER_ROOM_FAILED: function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        var hintComp =  instanceGlobal.hint.getComponent("HintManager");
        hintComp.ShowHint("进入服务器失败！");
    },
    // ==========================================================================================================
    handler_PLAYER_ENTER_ROOM_NOTIFY: function(event) {
         cc.log("handler_PLAYER_ENTER_ROOM_NOTIFY");
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        let nAccountID = bodyMsg[index++]._int_value;
        let nTeamID = bodyMsg[index++]._int_value;

        var item = {};
        var players = instanceGlobal.selfData.players;
        var playersCount = players.length;

        if (instanceGlobal.confData.bHoldPlayersInfo === true)
            {
            var isExsit = false;
            item.nAccountID = bodyMsg[index]._int_value;
            for (var i = 0; i < playersCount; i++) {
                if (item.nAccountID === players[i].nAccountID) {
                    isExsit = true;
                }
            }       
            if (!isExsit) {
                 players.push(item);
             }
        }

        // =====
        for (let t=0; t<gameData.vectTeamList.length; t++)
        {   
            let itemFighter = gameData.vectTeamList[t];
            if (itemFighter.nTeamID==nTeamID) 
            {
                itemFighter.isOffline = 0;
                gameData.RefreshPlayerData(1);
                break;
            }
        }
    },
    // ==========================================================================================================
    handler_PLAYER_LEAVE_ROOM_NOTIFY: function(event) {
        cc.log("handler_PLAYER_LEAVE_ROOM_NOTIFY");                        
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        var nAccountID = bodyMsg[index++]._int_value;
        var nIsOffline = bodyMsg[index++]._int_value; // 1-断线，但仍在战斗中
        var players = instanceGlobal.selfData.players;
        var playersCount = players.length;

        if (instanceGlobal.confData.bHoldPlayersInfo === true)
        {
            for (var i = 0; i < playersCount; i++) {
                if (nAccountID === players[i].nAccountID) {
                    if (nIsOffline == 1) {} // 设置断线标志 。。。
                    else players.splice(i, 1);
                    break;
                }
           }   
        }

        let t=0;
        for (t=0; t<gameData.vectTeamList.length; t++)
        {
            if (gameData.vectTeamList[t].nAccountID == nAccountID)
            {
                gameData.vectTeamList[t].isOffline = nIsOffline;
                break;
            }
        }
        // ----当有人离开或断线 ，不在战斗中所有人都离开房间
        if(nIsOffline == 1)
        {
            if(gameData.nBattleStatus == gameConstDef.FIGHT_STATUS.INIT)
            {
                gameData.nLeaveRoomFlag = 1;
                instanceGlobal.GetGameController(instanceGlobal.selfData.nCurGameID).SendMsg(gameConstDef.CONNECT_CALLBACK_STATUS.HOME_LEAVE_TEAM);
            }else 
            {
                if(gameData.nBattleStatus == gameConstDef.FIGHT_STATUS.END)gameData.nLeaveRoomFlag = 1;
                gameData.RefreshPlayerData(1);
            }
        }
    },
    // ===========================================================================================================
    handler_TEAM_ALL_READY_SUCCESS: function (event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        var nTeamID =  bodyMsg[index++]._int_value;
        var nMatchTS =  bodyMsg[index++]._int_value;

        gameData.nTeamID = nTeamID;
        gameData.nMatchTS = nMatchTS;

        if(nMatchTS > 0)
        {
            gameData.nMatchCurSignCount += 1; 
        }else
        {
            gameData.nMatchCurSignCount -= 1;
        }
        gameData.RefreshGameWait();

     },
    // ===========================================================================================================
    handler_TEAM_ALL_READY_NOTIFY: function (event) 
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ===========================================================================================================
    handler_TEAM_ALL_READY_FAILED: function (event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
     },
    // ===========================================================================================================
    handler_LEAVE_TEAM_NOTIFY:function(event){
        cc.log("handler_LEAVE_TEAM_NOTIFY");                
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        var nAccountID = bodyMsg[index++]._int_value;

        if(nAccountID == instanceGlobal.selfData.nAccountID )
        {
             if(gameData.nLeaveRoomFlag == 1 && gameData.nBattleStatus == gameConstDef.FIGHT_STATUS.INIT)
            {
                gameData.nLeaveRoomFlag = 0;
                instanceGlobal.GetGameController(instanceGlobal.selfData.nCurGameID).SendMsg(gameConstDef.CONNECT_CALLBACK_STATUS.HOME_ENTER_ROOM);
            }
        }
    },
   

    // ===========================================================================================================
    handler_ENTER_BATTLE_NOTIFY: function(event) 
    {
        cc.log("handler_ENTER_BATTLE_NOTIFY");        
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

        let index = 0;
        let nBattleID = bodyMsg[index++]._int_value;
        if (nBattleID == instanceGlobal.selfData.nBattleID)
        {
            let vectList = bodyMsg[index++]._vect_value;
            let itemCount = 2;
            let count = vectList.length / itemCount;
            for (let i = 0; i < count; i++) 
            {
                let nTeamID = vectList[i * itemCount + 0]._int_value;
                let nSit = vectList[i * itemCount + 1]._int_value;

                if (nTeamID !== instanceGlobal.selfData.nTeamID)
                {
                    var item = instanceGlobal.selfData.battleTeams[nSit-1];
                    item.nTeamID = nTeamID;

                    let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_GAME,constDef.MESSAGE.GET_TEAM_MEMBERS_REQ,false); 
                    let vectIndex = 0;
                    ProtocolMessage.AddVectItemVect(msg._body_msg);
                    ProtocolMessage.AddVectItemInt(msg._body_msg[vectIndex]._vect_value, nTeamID);
                    instanceGlobal.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);                    
                }
            }
        }
        
    },
    handler_ENTER_BATTLE_SUCCESS:function(event)
    {
        cc.log("handler_ENTER_BATTLE_SUCCESS");
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);
        gameData.ClearBattleData();
        if(bodyMsg.length > 0)
        {
            gameData.InitBattleData(bodyMsg);
        }
        var curComp = instanceGlobal.load.getComponent("LoadManager");
        curComp.Show('Yingsanzhang_war');
    },
    handler_ENTER_BATTLE_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ===========================================================================================================
      
     handler_FIGHT_READY_SUCCESS : function(event)
    {
        cc.log("handler_FIGHT_READY_SUCCESS");        
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
    },
    // ===========================================================================================================
      handler_FIGHT_READY_FAILED : function(event)
    {
        cc.log("handler_FIGHT_READY_FAILED");
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    handler_FIGHT_READY_NOTIFY: function(event) {
        cc.log("handler_FIGHT_READY_NOTIFY");
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        var nAccountID = bodyMsg[index++]._int_value;
        var teamList = gameData.vectTeamList;
        for(let j=0;j<teamList.length;j++)
        {
            if(nAccountID == teamList[j].nAccountID)
            {
                teamList[j].isOnReady = 1;
                break;
            }
        }

        if(nAccountID == instanceGlobal.selfData.nAccountID)
        {
            let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_GAME,constDef.MESSAGE.SCENE_READY_REQ,false); 
            ProtocolMessage.AddVectItemByte(msg._body_msg, 100);
            instanceGlobal.SocketManager.SendMessage(constDef.SERVER_URL.game, msg); 
        }

        gameData.RefreshPlayerData(2);
     },
    // ===========================================================================================================
    handler_SCENE_READY_NOTIFY: function(event) {
        cc.log("handler_SCENE_READY_NOTIFY");

        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);  

        var index = 0;
        var nAccountID = bodyMsg[index++]._int_value;
        if(nAccountID == instanceGlobal.selfData.nAccountID)
        {
            gameData.RefreshData();
        }           
     },
     // ==========================================================================================================
      handler_SCENE_READY_SUCCESS:function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;       
     },     
     // ==========================================================================================================
     handler_SCENE_READY_FAILED:function(event) {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;       
    
     },  
    // ===========================================================================================================
    handler_FIGHT_BEGIN_NOTIFY: function(event) 
    {
        cc.log("handler_FIGHT_BEGIN_NOTIFY");
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        gameData.nCurSit =bodyMsg[index++]._int_value;; 
        let vectList = bodyMsg[index++]._vect_value;
        let itemCount = 5;
        let count = vectList.length / itemCount;
        for (let i = 0; i < count; i++)
        {
            var index1 = 0;
            var item = gameData.vectTeamList[i];
            item.nTeamID = vectList[i * itemCount + index1++]._int_value;         
            item.nSit    = vectList[i * itemCount + index1++]._int_value;         
            item.puke[0] = vectList[i * itemCount + index1++]._int_value;
            item.puke[1] = vectList[i * itemCount + index1++]._int_value;
            item.puke[2] = vectList[i * itemCount + index1++]._int_value;
        }     

        gameData.nBattleStatus = gameConstDef.FIGHT_STATUS.BEGIN;
        
        gameData.nClientStatus = gameConstDef.FIGHT_STATUS.C_BEGIN;
        
        gameData.RefreshData();
    },   
    // ===========================================================================================================
    handler_FIGHT_END_NOTIFY:function(event)
    {
        cc.log("handler_FIGHT_END_NOTIFY");
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        let index = 0;
        let vectList = bodyMsg[index++]._vect_value;
        let itemCount = 3;
        let count = vectList.length / itemCount;
        let index1 = 0;
        for (let i = 0; i < count; i++)
        {
            let nTeamID = vectList[index1++]._int_value;
            let nResult = vectList[index1++]._int_value;
            let nMoney = vectList[index1++]._int_value;
            for (let t=0;t<gameData.vectTeamList.length;t++)
            {
                if (gameData.vectTeamList[t].nTeamID == nTeamID)
                {
                    gameData.vectTeamList[t].nResult = nResult;
                    gameData.vectTeamList[t].nMoney = nMoney;          // 基数
                    break;
                }
            }
        }
        var arr =null;
        for(var i = 0;i<gameData.puke.length;i++)
        {
            arr = gameData.puke[i].splice(1,gameData.puke[i].length - 1);
            var temp_arr = gameData.OrderPuke(arr);
                
            for(let n=0;n<temp_arr.length;n++)
            {
                gameData.puke[i].push(temp_arr[n]);
            }  
        }
        gameData.nBattleStatus = gameConstDef.FIGHT_STATUS.END;
        gameData.nClientStatus = gameConstDef.FIGHT_STATUS.C_END_SHOW_LEFT_CARDS;
        gameData.RefreshData();
    },
   
    // =========================================================================================================
    handler_BET_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
    },
   // =========================================================================================================
    handler_BET_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
    },
     // =========================================================================================================
    handler_BET_NOTIFY:function(event)
    {
        /*
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        var nTeamID = bodyMsg[index++]._int_value;
        var nCurGrabBankerVal = bodyMsg[index]._int_value;
       
        gameData.nCurStatusTS = instanceGlobal.GetRightTime();       //

        var nCurGrabBankerSeq = 0;
        var teamList = gameData.vectTeamList;
        for(let i=0;i<teamList.length;i++)
        {
            if(teamList[i].nTeamID == nTeamID)
            {
                gameData.nClientStatus = gameConstDef.FIGHT_STATUS.C_BEGIN_GRAB_BANKER + i;
                nCurGrabBankerSeq = i + 1;
                break;
            }
        }
    
        if(nCurGrabBankerVal > gameData.nCurBankerVal)
        {
            gameData.nCurBankerSeq = nCurGrabBankerSeq;              
            gameData.nCurBankerVal = nCurGrabBankerVal;  
        }
         
        if( nCurGrabBankerSeq == 3 || gameData.nCurBankerVal == 3)
        {
            if(nCurGrabBankerSeq == 3 && gameData.nCurBankerVal == 0)
            {
                //没人叫分，默认第一个人
                gameData.nCurBankerSeq = 1;
                gameData.nCurBankerVal = 1;
            }
            gameData.puke[gameData.nCurBankerSeq-1][0] = 20;
            for(let j=0;j<3;j++)
            {
                gameData.puke[gameData.nCurBankerSeq-1].push( gameData.arrLandCards[j]);    
            }

            gameData.nClientStatus = gameConstDef.FIGHT_STATUS.C_BANKER_FINISH;
            gameData.RefreshData();
   
            if(gameData.nClientStatus==gameConstDef.FIGHT_STATUS.C_BANKER_FINISH)
            {
                gameData.nCurTurnSeq = gameData.nCurBankerSeq;
                gameData.nBattleStatus=gameConstDef.FIGHT_STATUS.FIGHTING;
                gameData.nClientStatus=gameConstDef.FIGHT_STATUS.C_FIGHTING;
                gameData.RefreshData();
            }
        }
        else 
        {
            gameData.RefreshData();
        }*/
    },
     // =========================================================================================================
    handler_FOLLOW_BET_NOTIFY:function(event)
    {

        /*
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
        var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        var index = 0;
        var totalCount = bodyMsg.length;
        var nTeamID = bodyMsg[index]._int_value;

        var teamList = gameData.vectTeamList;
        var nCurOutPukeSeq = 0;
        gameData.nCurStatusTS = instanceGlobal.GetRightTime();
        for(let i=0;i<teamList.length;i++)
        {
            if(teamList[i].nTeamID == nTeamID)
            {
                nCurOutPukeSeq = i + 1;
                break;
            }
        }
        
        // 是否出牌
        if(totalCount > 2)    // 消息至少含有nTeamID 、battleId
        {
            gameData.arrCurOutPuke.length = 0;
            gameData.arrCurOutPuke.push(totalCount-2);
            for(let i=1;i<totalCount-1;i++)
            {
                var cardValue = bodyMsg[i]._int_value;
                gameData.arrCurOutPuke.push(cardValue);    
            }
            gameData.nCurOutPukeSeq = nCurOutPukeSeq;


            gameData.puke[nCurOutPukeSeq-1][0] -= gameData.arrCurOutPuke[0];
            for(let m=1;m<gameData.arrCurOutPuke.length;m++)
            {
                for(let z=gameData.puke[nCurOutPukeSeq-1].length-1;z>0;z--)
                {
                    if(gameData.puke[nCurOutPukeSeq-1][z] == gameData.arrCurOutPuke[m])
                    { 
                        gameData.puke[nCurOutPukeSeq-1].splice(z,1);
                        break;
                    }
                }     
            }
         }
        
        gameData.nCurTurnSeq = (nCurOutPukeSeq>=3)?1:(nCurOutPukeSeq+1);

        gameData.RefreshData();*/
    },
     // =========================================================================================================
     handler_FOLLOW_BET_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal; 
    },
     // =========================================================================================================
    handler_FOLLOW_BET_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_ADD_BET_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_ADD_BET_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_ADD_BET_NOTIFY:function(event)
    {
        // var bodyMsg = event.detail.msgBody;
        // var instanceGlobal = event.detail.instanceGlobal;
        // var gameData = instanceGlobal.GetGameData(instanceGlobal.selfData.nCurGameID);

        // var index = 0;
        // var nTeamID = bodyMsg[index++]._int_value;
        // var nFlag   = bodyMsg[index++]._int_value;
        
        // var teamList = gameData.vectTeamList;
        // for(let i=0;i<teamList.length;i++)
        // {
        //     if(teamList[i].nTeamID == nTeamID)
        //     {
        //         teamList[i].isDeposit = nFlag;
        //         break;
        //     }
        // }
        // gameData.RefreshPlayerData(2);
    },
        // ============================================================================================================
    handler_LOOK_CARD_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_LOOK_CARD_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_LOOK_CARD_NOTIFY:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
        // ============================================================================================================
    handler_DISCARD_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_DISCARD_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_DISCARD_NOTIFY:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

    },
    // ============================================================================================================
    handler_COMPARE_CARD_SUCCESS:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_COMPARE_CARD_FAILED:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;
    },
    // ============================================================================================================
    handler_COMPARE_CARD_NOTIFY:function(event)
    {
        var bodyMsg = event.detail.msgBody;
        var instanceGlobal = event.detail.instanceGlobal;

    },

}
// ============================================================================================================
module.exports = GameMessage;




