var constDef = require("ConstDef");
var ProtocolMessage = require("ProtocolMessage");
var GlobalManager = require("GlobalManager");
var gameConstDef = require("YingsanzhangConstDef");

cc.Class({
    extends: cc.Component,

    properties: 
    {

        instanceGlobal: null,

        nGameID:1,
        rooms:[],   //item={nRoomID/onLineCount},
        // -------[队伍]---------------------------
        nTeamID : 0,
        nOpenMode:0,
        
         
        // -------[战斗]---------------------------
        nBattleID:0,
        nBattleStatus:0,     //0 初始化   战斗结束      1 战斗中
        nBattleStatusTS:0,    //战斗状态时间

        nClientStatus:0,

        nLeaveRoomFlag:0,   // 0 表示主动离开  1 表示房间解散

        // -- 参战多方队伍ID列表
        // vectTeamList
        vectTeamList:[],// 当前战斗队伍 item = {nTeamID}      
                        //                  = {nCardType}   // 牌类型
                        //                  = {nLookFlag}   // 是否看牌
                        //                  = {nGiveupFlag}   //是否弃牌
                        //                  = {nTotalMoney}   //总钱数
                        //                  = {puke[0,1,3]}      //牌
        puke:[],  //玩家的当前牌，
        nAccountID:0,
        nBattleID:0,
        nLogicStatus:0,//状态
        nLogicTS:0, // 当前状态时间戳
        nCurSit:0, // 当前座位号
        nCurRate:0, // 当前底注
	   
        //-------[房间 gameServer]-------------------------------
        nRoomID:0,
        // -------[GAME相关数据]---------------------------
        nFdiamondH :0,
        nFdiamondL :0,
        nFcoinH    :0,
        nFcoinL    :0,
        nFbeginner_flag:1,

        // -------[比赛相关数据]---------------------------------
        // hashMatchData:{},    // key=matchTS  data={}

        // hashMatchData[ts] = {}

        nMatchCurSignCount:0,  // 比赛当前报名人数
        nMatchTS:0,        // 比赛开始时间
        nMatchFlag:0,
        nMatchStatus:0,
        nMatchStatusTS:0,
        nMatchRemainCount:0,
        nMatchRank:0,

        //---------------[临时变量]------------------------------
        
    },
     onLoad: function () {    
    },
     // -- 获取自己的座位，从1开始；0表示不在房间
    GetSelfSit:function()
    {
        if(this.nTeamID===0) return 0;
        let selfIndex=0;
        for (selfIndex=0; selfIndex<this.vectTeamList.length;selfIndex++)
        {
            if (this.vectTeamList[selfIndex].nTeamID == this.nTeamID) break;
        }
        if (selfIndex == this.vectTeamList.length) return 0;
        return (selfIndex+1);
    },
   ClearOnePlayerData:function(pos)
    {
        let item = this.vectTeamList[pos];
        item.nTeamID = 0;
        item.nCardType = -1; // -1表示尚未抢庄，0表示不抢，1~4表示抢庄倍数 
        item.nLookFlag = 0;
        item.nGiveupFlag = 255;
        item.puke = [];
        item.puke.push(0);
        item.puke.push(0);
        item.puke.push(0);
        item.nResult = 0;
        item.nTotalMoney = 0;
        item.nAccountID=0;
        item.nSit = 0;        
        item.nick="";
        item.sex = 0;
        item.head=0;
        item.customHead=null;
        item.coinH=0;
        item.coinL=0;
        item.isOffline = 0;
    },
    ClearBattleData : function (bStayInGame)
    {
        if (bStayInGame!==true) bStayInGame = false;

        this.nCurBanker = 0;

        if (bStayInGame === true)
        {
            for (let i=0; i<5;i++)
            {
                let item = this.vectTeamList[i];
                item.nTeamID = 0;
                item.nCardType = 0; 
                item.nLookFlag = 0;
                item.nGiveupFlag = 0;
                item.nTotalMoney = 0;
                item.nAccountID = 0;                
                item.nSit = 0;
                item.puke = [];
                item.puke.push(0);
                item.puke.push(0);
                item.puke.push(0);
            }
            this.nClientStatus=0;
            this.ClientStatusParam=[];
        }
        else
        {
            this.nBattleID = 0;
            this.nBattleStatus = 0;
            this.nBattleStatusTS = 0;

            this.vectTeamList = [];
            for (let i=0; i<5;i++)
            {
                let item = {};
                item.nTeamID = 0;
                item.nCardType = 0; 
                item.nLookFlag = 0;
                item.nGiveupFlag = 0;
                item.nTotalMoney = 0;    
                item.nAccountID = 0;            
                item.puke = [];
                item.puke.push(0);
                item.puke.push(0);
                item.puke.push(0);
                item.nResult = 0;
                item.nAccountID=0;
                item.nick="";
                item.sex = 0;
                item.head=0;
                item.customHead=null;
                item.coinH=0;
                item.coinL=0;
                this.vectTeamList.push(item); 
            }
            this.nClientStatus=0;
            this.ClientStatusParam=[];
        }
    },

    InitBattleData:function(bodyMsg)
    {
        let index = 0;
        this.nTeamID = bodyMsg[index++]._int_value;
        this.nBattleID = bodyMsg[index++]._int_value;
        this.nLogicStatus = bodyMsg[index++]._int_value;
        this.nLogicTS = bodyMsg[index++]._int_value;
        
        this.nCurSit = bodyMsg[index++]._int_value;
        this.nCurRate = bodyMsg[index++]._int_value;
        
        var vectList = bodyMsg[index++]._vect_value;
        var itemCount = 8;
        var count = vectList.length / itemCount;
        for (let i = 0; i < count; i++) 
        {
            var index1 = 0;
            var item = this.vectTeamList[i];
            item.nTeamID = vectList[i * itemCount + index1++]._int_value;
            item.nCardType = vectList[i * itemCount + index1++]._int_value-1; 
            item.nLookFlag = vectList[i * itemCount + index1++]._int_value;
            item.nGiveupFlag = vectList[i * itemCount + index1++]._int_value;
            item.nTotalMoney = vectList[i * itemCount + index1++]._int_value;            
            item.puke[0] = vectList[i * itemCount + index1++]._int_value;
            item.puke[1] = vectList[i * itemCount + index1++]._int_value;
            item.puke[2] = vectList[i * itemCount + index1++]._int_value;
        }

        //获取队伍成员账号ID
        let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_GAME,constDef.MESSAGE.GET_TEAM_MEMBERS_REQ,false); 
        let vectIndex = 0;
        ProtocolMessage.AddVectItemVect(msg._body_msg);
        for(let i=0;i<this.vectTeamList.length;i++)
        {
            if (this.vectTeamList[i].nTeamID > 0)
            {
                ProtocolMessage.AddVectItemInt(msg._body_msg[vectIndex]._vect_value, this.vectTeamList[i].nTeamID);
            }
        }
        GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);
    },
    ClearMatchData:function()
    {
        this.nMatchCurSignCount = 0; 
        this.nMatchTS = 0;        
        this.nMatchFlag = 0;
        this.nMatchStatus = 0;
        this.nMatchStatusTS = 0;
        this.nMatchRemainCount = 0;
        this.nMatchRank = 0; 
    },
    RefreshData:function(nDataType)
    {
        if(nDataType===null) nDataType = 0;
        if (typeof(nDataType) == "undefined") nDataType = 0; 

        var curScene = cc.director.getScene();
        var Canvas = curScene.getChildByName("Canvas");
        var WarUI = Canvas.getComponent("Yingsanzhang_WarUI");
        if (WarUI) 
        {
            if(nDataType==0) WarUI.onReady();
            else if(nDataType == 1)WarUI.RefreshPlayerData();
        }
    },
    RefreshPlayerData:function(nDataType)
    {
        // -- 0 : 全部刷新
        // -- 1 : 只刷新玩家基本数据 
        // -- 2 : 不刷新牌的数目
        // -- 3 : 不刷新牌

        if(nDataType===null) nDataType = 0;
        if (typeof(nDataType) == "undefined") nDataType = 0; 

        var curScene = cc.director.getScene();
        var Canvas = curScene.getChildByName("Canvas");
        var WarUI = Canvas.getComponent("Yingsanzhang_WarUI");
        if (WarUI) 
        {
            WarUI.RefreshPlayerData(nDataType);
        }
    },
   
    RefreshGameWait:function()
    {
        var curScene = cc.director.getScene();
        var Canvas = curScene.getChildByName("Canvas");
        var matchWaitPanel = Canvas.getChildByName("waitPanel"); 
        if(matchWaitPanel)
        {
            matchWaitPanel.getComponent("wait").RefreshUI();
        }
    },
    
    initCurGameRemainCount:function()  // 计算当前这局比赛人数    不需要考虑打立出局
    {
        var curNodeBaseInfo = this.getCurNodeBaseInfo();
        switch(this.nMatchStatus)
        {
            case constDef.MATCH_STATUS.INIT:
            {
                this.nMatchRemainCount = this.nMatchCurSignCount;
                break;
            } 
            case constDef.MATCH_STATUS.PHASE_1_BEGIN:
            {
                if(curNodeBaseInfo.Fphase_1_mode == constDef.MATCH_MODE.FIXED_ROUND)
                {
                    var rounds = curNodeBaseInfo.Fphase_1_param3.substr(0,curNodeBaseInfo.Fphase_1_param3.length-1);
                    var perRoundPersonArr = rounds.split(";");
                    if(this.nMatchRemainCount == 0) 
                    {
                        this.nMatchRemainCount = perRoundPersonArr[0];
                        break;
                    }

                    for(let i=1;i<perRoundPersonArr.length;i++)
                    {
                        if(perRoundPersonArr[i-1] == this.nMatchRemainCount)
                        {
                            this.nMatchRemainCount = perRoundPersonArr[i];
                            break;
                        }
                        
                     }
                }
                else if(curNodeBaseInfo.Fphase_1_mode == constDef.MATCH_MODE.OUT_AT_ONCE)
                {
                    if(this.nMatchRemainCount == 0) 
                    {
                        this.nMatchRemainCount = this.nMatchCurSignCount;
                    }
                }
                break;
            }
            case constDef.MATCH_STATUS.PHASE_2_BEGIN:
            {

                if(curNodeBaseInfo.Fphase_2_mode == constDef.MATCH_MODE.FIXED_ROUND)
                {
                    var rounds = curNodeBaseInfo.Fphase_2_param3.substr(0,curNodeBaseInfo.Fphase_2_param3.length-1);
                    var perRoundPersonArr = rounds.split(";");
                    for(let i=0;i<perRoundPersonArr.length;i++)
                     {
                        if(perRoundPersonArr[i-1] == this.nMatchRemainCount)
                        {
                            this.nMatchRemainCount = perRoundPersonArr[i];
                            break;
                        }
                     }
                }else if(curNodeBaseInfo.Fphase_2_mode == constDef.MATCH_MODE.OUT_AT_ONCE)
                {
                    if(this.nMatchRemainCount == 0) 
                    {
                        this.nMatchRemainCount = this.nMatchCurSignCount;
                    }
                }
                break;
            }
        }
    },
    getCurNodeBaseInfo:function()
    {
        var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);
        var roomArea = GlobalManager.instance.confData.getRoomArea(GlobalManager.instance.selfData.nCurGameID,2);   // 2表示比赛
        var nodeBaseinfos = GlobalManager.instance.confData.getGameNode(roomArea.Farea_id);
        for(let i=0;i<nodeBaseinfos.length;i++)
        {
             var room = GlobalManager.instance.confData.getGameRoom(nodeBaseinfos[i].Fnode_id);
             if(room.Froom_id == gameData.nRoomID)
             {
                var curNodeBaseInfo = nodeBaseinfos[i];
                break;
             }
         }
         return curNodeBaseInfo;
    },
     // 从大到小排序
    OrderPuke:function(arr)
    {
        var tempArr = [];
        // 大王
        for(let t=0;t<arr.length;t++)
        {
             let cardValue = arr[t];
             if(cardValue == 95)
             {
                 tempArr.push(cardValue);
             }
        }
        // 小王
       for(let t=0;t<arr.length;t++)
        {
             let cardValue = arr[t];
             if(cardValue == 94)
             {
                 tempArr.push(cardValue);
             }
        }

        // 1、2
        for(let i=2;i>0;i--)
        {
            for(let t=0;t<arr.length;t++)
            {
                let cardValue = arr[t];
                let LowValue = cardValue & 0x0f; 
                if(LowValue == i)
                {
                    tempArr.push(cardValue);
                }
            }
        }
        // 3-Q
        for(let i=13;i>2;i--)
        {
            for(let t=0;t<arr.length;t++)
            {
                let cardValue = arr[t];
                let LowValue = cardValue & 0x0f; 
                if(LowValue == i)
                {
                    tempArr.push(cardValue);
                }
            }
        }
        return tempArr;
        
    },
    GetCardVal:function(card)
    {
        return (card & 0x0F);
    },

    GetCardCommonVal:function(card)
    {
        if (card == 0) return 0;
        var val = this.GetCardVal(card);
        if (val <= 2) val += 11;
		else if (val <= 13) val -= 2;
		return val;
    },

    // 出牌规则检查
    CheckCardsValid:function(cards)
    {
        var count = cards.length;
        for(let i=0;i<count;i++)
        {
            if (cards[i] < 0x11) return gameConstDef.CARDS_TYPE.NONE;
            if ((cards[i] > 0x1D) && (cards[i] < 0x21)) return gameConstDef.CARDS_TYPE.NONE;
            if ((cards[i] > 0x2D) && (cards[i] < 0x31)) return gameConstDef.CARDS_TYPE.NONE;
            if ((cards[i] > 0x3D) && (cards[i] < 0x41)) return gameConstDef.CARDS_TYPE.NONE;
            if ((cards[i] > 0x4D) && (cards[i] < 0x5E)) return gameConstDef.CARDS_TYPE.NONE;
            if (cards[i] > 0x5F) return gameConstDef.CARDS_TYPE.NONE;
        }

        var newCards = this.OrderPuke(cards);

        if(count == 0) return gameConstDef.CARDS_TYPE.NONE;
        if(count == 1) return ((gameConstDef.CARDS_TYPE.TYPE_X<<16) + newCards[0]);
        if(count == 2)
        {
            if(this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) return  ((gameConstDef.CARDS_TYPE.TYPE_XX << 16) + newCards[0]);
            else if((newCards[0] == 0x5F) && (newCards[1] == 0x5E)) return (gameConstDef.CARDS_TYPE.ROCKET << 16);
            else return gameConstDef.CARDS_TYPE.NONE;
        }
        if(count == 3)
        {
            if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1]) && this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2]))return ((gameConstDef.CARDS_TYPE.TYPE_XXX<<16)+newCards[0]);
		    else return gameConstDef.CARDS_TYPE.NONE;
        }
        if(count == 4)
        {
            if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1]) 
                && this.GetCardVal(newCards[1])  == this.GetCardVal(newCards[2]) 
                &&	this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3]) 
			) return ((gameConstDef.CARDS_TYPE.BOMB << 16) + newCards[0]);
            else
            {
                if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1]) && this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) return ((gameConstDef.CARDS_TYPE.PLANE_S_1<<16)+newCards[1]);
                else if (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2]) && this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) return ((gameConstDef.CARDS_TYPE.PLANE_S_1<<16)+newCards[2]);
                else return gameConstDef.CARDS_TYPE.NONE;
            }
        }

        if(count == 5)
        {
            if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1]) && this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2]))
            {
                if (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) return (gameConstDef.CARDS_TYPE.PLANE_B_1 << 16)+newCards[0];
                else return gameConstDef.CARDS_TYPE.NONE;
            }
            else if ((this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])))
            {
                if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) return (gameConstDef.CARDS_TYPE.PLANE_B_1<<16)+newCards[2];
                else return gameConstDef.CARDS_TYPE.NONE;
            }
            else
            {
                if(this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;

                if((this.GetCardCommonVal(newCards[0]) == this.GetCardCommonVal(newCards[1])+1) && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                    && (this.GetCardCommonVal(cards[2]) == this.GetCardCommonVal(cards[3]) + 1) && (this.GetCardCommonVal(cards[3]) == this.GetCardCommonVal(newCards[4]) + 1))
                    return (gameConstDef.CARDS_TYPE.SHUNZI_5<<16)+newCards[4];
                else return gameConstDef.CARDS_TYPE.NONE;
            }
        }

        if(count == 6)
        {
            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])))
            {
                return (gameConstDef.CARDS_TYPE.SHIP_S<<16)+newCards[0];
            }
            if ((this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4]))) 
            return (gameConstDef.CARDS_TYPE.SHIP_S<<16)+newCards[1];
            if ((this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
            {
                return (gameConstDef.CARDS_TYPE.SHIP_S<<16)+newCards[2];
            }

            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;

            if (((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
                && ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1))
                return  (gameConstDef.CARDS_TYPE.LIAN_SHUN_2<<16)+newCards[3];

            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5]))
                && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1))
                return (gameConstDef.CARDS_TYPE.LIAN_DUI_3<<16)+newCards[5];

            if ((this.GetCardCommonVal(newCards[0]) == this.GetCardCommonVal(newCards[1]) + 1) && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1) && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1) )
                return (gameConstDef.CARDS_TYPE.SHUNZI_6<<16)+newCards[5];
            else return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 7)
        {
            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
            if ((this.GetCardCommonVal(newCards[0]) == this.GetCardCommonVal(newCards[1]) + 1) && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1) && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1) && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1))
                return (gameConstDef.CARDS_TYPE.SHUNZI_7 << 16)+newCards[6];
            else return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 8)
        {
            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])))
            {
                if ((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])))
                    return gameConstDef.CARDS_TYPE.NONE;
                if ((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])))
                    return (gameConstDef.CARDS_TYPE.SHIP_B << 16) + newCards[0];
                return gameConstDef.CARDS_TYPE.NONE;
            }
            
            if ((this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
            {
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])))
                    return (gameConstDef.CARDS_TYPE.SHIP_B << 16) + newCards[2];
                return gameConstDef.CARDS_TYPE.NONE;
            }
            if ((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])))
            {
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])))
                    return (gameConstDef.CARDS_TYPE.SHIP_B << 16) + newCards[4];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
            {
                if ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                {
                    if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
                    if (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])) return gameConstDef.CARDS_TYPE.NONE;
                    if (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1) return (gameConstDef.CARDS_TYPE.PLANE_S_2<<16)+newCards[3];
                    return gameConstDef.CARDS_TYPE.NONE;
                }
                return gameConstDef.CARDS_TYPE.NONE;
            }
            if ((this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])))
            {
                if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) return gameConstDef.CARDS_TYPE.NONE;
                if ((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])))
                {
                    if (this.GetCardCommonVal(newCards[1]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
                    if (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) return gameConstDef.CARDS_TYPE.NONE;
                    if (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1) return (gameConstDef.CARDS_TYPE.PLANE_S_2<<16)+newCards[4];
                    return gameConstDef.CARDS_TYPE.NONE;
                }
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if ((this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])))
            {
                if ((this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])))
                {
                    if (this.GetCardCommonVal(newCards[2]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
                    if (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) return gameConstDef.CARDS_TYPE.NONE;
                    if (this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1) return (gameConstDef.CARDS_TYPE.PLANE_S_2<<16)+newCards[5];
                    return gameConstDef.CARDS_TYPE.NONE;
                }
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3]))
                && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7]))
                && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1))
                return (gameConstDef.CARDS_TYPE.LIAN_DUI_4<<16)+newCards[6];

            if ((this.GetCardCommonVal(newCards[0]) == this.GetCardCommonVal(newCards[1]) + 1) && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1) && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1) && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1))
                return (gameConstDef.CARDS_TYPE.SHUNZI_8<<16)+newCards[7];
            return gameConstDef.CARDS_TYPE.NONE;
        }
        if(count == 9)
        {
            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;

            if (((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
                && ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                && ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])))
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1)
                && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1))
                return (gameConstDef.CARDS_TYPE.LIAN_SHUN_3<<16)+newCards[6];

            if ((this.GetCardCommonVal(newCards[0]) == this.GetCardCommonVal(newCards[1]) + 1) && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1) && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1) && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1) && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1))
                return (gameConstDef.CARDS_TYPE.SHUNZI_9<<16)+newCards[8];

            return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 10)
        {
            if ( ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
			&& ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5]))) )
            {
                if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardCommonVal(newCards[2]) != this.GetCardCommonVal(newCards[3]) + 1) return gameConstDef.CARDS_TYPE.NONE;
                if ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9])) && (this.GetCardVal(newCards[8]) != this.GetCardVal(newCards[7])))
                    return (gameConstDef.CARDS_TYPE.PLANE_B_2<<16)+newCards[3];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])))
                && ((this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7]))))
            {
                if (this.GetCardCommonVal(newCards[4]) != this.GetCardCommonVal(newCards[5]) + 1) return gameConstDef.CARDS_TYPE.NONE;
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9])))
                    return (gameConstDef.CARDS_TYPE.PLANE_B_2<<16)+cards[6];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])))
                && ((this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9]))))
            {
                if (this.GetCardCommonVal(newCards[6]) != this.GetCardCommonVal(newCards[7]) + 1) return gameConstDef.CARDS_TYPE.NONE;
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[1]) != this.GetCardVal(newCards[2])))
                    return (gameConstDef.CARDS_TYPE.PLANE_B_2<<16)+newCards[7];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;

            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3]))
                && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9]))
                && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1))
                return (gameConstDef.CARDS_TYPE.LIAN_DUI_5<<16)+newCards[8];

            if ((this.GetCardCommonVal(newCards[0]) == this.GetCardCommonVal(newCards[1]) + 1) && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1) && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1) && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1) && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)
                && (this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1) )
                return (gameConstDef.CARDS_TYPE.SHUNZI_10<<16)+newCards[9];
            return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 11)
        {
            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
            if ((this.GetCardCommonVal(newCards[0]) == this.GetCardCommonVal(newCards[1]) + 1) && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1) && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1) && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1) && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)
                && (this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1) && (this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1))
                return (gameConstDef.CARDS_TYPE.SHUNZI_11<<16)+newCards[10];
            return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 12)
        {
            if (((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
			&& ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
			&& ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])))
			&& ((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[9])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11]))))
            {
                if (((this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1))
                    && ((this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1))
                    && ((this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1)))
                    return (gameConstDef.CARDS_TYPE.LIAN_SHUN_4<<16)+newCards[9];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
                && ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                && ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8]))))
            {
                // if ((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) || (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11]))) return gameConstDef.CARDS_TYPE.NONE;
                // if (this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[8])) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1))
                    && ((this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)))
                    return (gameConstDef.CARDS_TYPE.PLANE_S_3<<16)+newCards[6];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])))
                && ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                && ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8]))))
            {
                // if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) || (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2]))) return gameConstDef.CARDS_TYPE.NONE;
                // if (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1))
                    && ((this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1)))
                    return (gameConstDef.CARDS_TYPE.PLANE_S_3<<16)+cards[9];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])))
                && ((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])))
                && ((this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9]))))
            {
                if (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1))
                    && ((this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1)))
                    return (gameConstDef.CARDS_TYPE.PLANE_S_3<<16)+newCards[7];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])))
                && ((this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])))
                && ((this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9])) && (this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10]))))
            {
                if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[1])) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1))
                    && ((this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)))
                    return (gameConstDef.CARDS_TYPE.PLANE_S_3<<16)+newCards[8];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;

            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11]))
                && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9]))
                && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)
                && (this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1))
                return (gameConstDef.CARDS_TYPE.LIAN_DUI_6<<16)+newCards[10];

            if ((this.GetCardCommonVal(newCards[0]) == this.GetCardCommonVal(newCards[1]) + 1) && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1) && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1) && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1) && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)
                && (this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1) && (this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1)
                && (this.GetCardCommonVal(newCards[10]) == this.GetCardCommonVal(newCards[11]) + 1))
                return (gameConstDef.CARDS_TYPE.SHUNZI_12<<16)+newCards[11];
            return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 14)
        {
            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;

            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11]))
                && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9]))
                && (this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13]))
                && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)
                && (this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1)
                && (this.GetCardCommonVal(newCards[11]) == this.GetCardCommonVal(newCards[12]) + 1))
                return (gameConstDef.CARDS_TYPE.LIAN_DUI_7<<16)+newCards[12];
            return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 15)
        {
            if (((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
			&& ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
			&& ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8]))))
            {
                if ((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) && (this.GetCardVal(newCards[11]) == this.GetCardVal(newCards[12])) && (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14])))
                {
                    if (((this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1))
                        && ((this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)))
                    {
                        if ((this.GetCardVal(newCards[10]) != this.GetCardVal(newCards[11])) && (this.GetCardVal(newCards[12]) != this.GetCardVal(newCards[13])))
                        {
                            return (gameConstDef.CARDS_TYPE.PLANE_B_3<<16)+newCards[6];
                        }
                    }
                }
                return gameConstDef.CARDS_TYPE.NONE;
            }


            if (((this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])))
			&& ((this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[8])))
			&& ((this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9])) && (this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10]))))
            {
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[11]) == this.GetCardVal(newCards[12])) && (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14])))
                {
                    if (((this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1))
                        && ((this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)))
                    {
                        if (this.GetCardVal(newCards[12]) != this.GetCardVal(newCards[13])) return (gameConstDef.CARDS_TYPE.PLANE_B_3<<16)+newCards[8];
                    }
                }
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])))
                && ((this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9])))
                && ((this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])) && (this.GetCardVal(newCards[11]) == this.GetCardVal(newCards[12]))))
            {
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14])))
                {
                    if (((this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1))
                        && ((this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1)))
                    {
                        if (this.GetCardVal(newCards[1]) != this.GetCardVal(newCards[2])) return (gameConstDef.CARDS_TYPE.PLANE_B_3<<16)+cards[10];
                    }
                }
                return gameConstDef.CARDS_TYPE.NONE;
            }


            if (((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])))
                && ((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])))
                && ((this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) && (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14]))))
            {
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                {
                    if (((this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1))
                        && ((this.GetCardCommonVal(newCards[11]) == this.GetCardCommonVal(newCards[12]) + 1)))
                    {
                        if ((this.GetCardVal(newCards[1]) != this.GetCardVal(newCards[2])) && (this.GetCardVal(newCards[3]) != this.GetCardVal(newCards[4])))  return (gameConstDef.CARDS_TYPE.PLANE_B_3<<16)+newCards[12];
                    }
                }
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
                && ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                && ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])))
                && ((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])))
                && ((this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) && (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14]))))
            {
                if (((this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1))
                    && ((this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1))
                    && ((this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1))
                    && ((this.GetCardCommonVal(newCards[11]) == this.GetCardCommonVal(newCards[12]) + 1)))
                    return (gameConstDef.CARDS_TYPE.LIAN_SHUN_5<<16)+newCards[12];
                return gameConstDef.CARDS_TYPE.NONE;
            }
            return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 16)
        {
            if (((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
			&& ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
			&& ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])))
            && ((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11]))))
            {
                if ((this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) || (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14])) || (this.GetCardVal(newCards[14]) == this.GetCardVal(newCards[15])))
                return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[11])) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1)) && ((this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1))
                    && ((this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1)))
                    return (gameConstDef.CARDS_TYPE.PLANE_S_4<<16)+newCards[9];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])))
                && ((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])))
                && ((this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9])))
                && ((this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])) && (this.GetCardVal(newCards[11]) == this.GetCardVal(newCards[12]))))
            {
                if ((this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14])) || (this.GetCardVal(newCards[14]) == this.GetCardVal(newCards[15]))) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)) && ((this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1))
                    && ((this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1)))
                    return (gameConstDef.CARDS_TYPE.PLANE_S_4<<16)+newCards[10];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])))
                && ((this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])))
                && ((this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9])) && (this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])))
                && ((this.GetCardVal(newCards[11]) == this.GetCardVal(newCards[12])) && (this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13]))))
            {
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) || (this.GetCardVal(newCards[14]) == this.GetCardVal(newCards[15]))) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14])) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[4]) == this.GetCardCommonVal(newCards[5]) + 1)) && ((this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1))
                    && ((this.GetCardCommonVal(newCards[10]) == this.GetCardCommonVal(newCards[11]) + 1)))
                    return  (gameConstDef.CARDS_TYPE.PLANE_S_4<<16)+newCards[11];
                return gameConstDef.CARDS_TYPE.NONE;
            }


            if (((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                && ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])))
                && ((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])))
                && ((this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) && (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14]))))
            {
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) || (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2]))) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) return gameConstDef.CARDS_TYPE.NONE;
                if (this.GetCardVal(newCards[14]) == this.GetCardVal(newCards[15])) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)) && ((this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1))
                    && ((this.GetCardCommonVal(newCards[11]) == this.GetCardCommonVal(newCards[12]) + 1)))
                    return  (gameConstDef.CARDS_TYPE.PLANE_S_4<<16)+newCards[12];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (((this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[5]) == this.GetCardVal(newCards[6])))
                && ((this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9])))
                && ((this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])) && (this.GetCardVal(newCards[11]) == this.GetCardVal(newCards[12])))
                && ((this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14])) && (this.GetCardVal(newCards[14]) == this.GetCardVal(newCards[15]))))
            {
                if (this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) return gameConstDef.CARDS_TYPE.NONE;
                if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) || (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])) || (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3]))) return gameConstDef.CARDS_TYPE.NONE;
                if (((this.GetCardCommonVal(newCards[6]) == this.GetCardCommonVal(newCards[7]) + 1)) && ((this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1))
                    && ((this.GetCardCommonVal(newCards[12]) == this.GetCardCommonVal(newCards[13]) + 1)))
                    return  (gameConstDef.CARDS_TYPE.PLANE_S_4<<16)+newCards[13];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11]))
                && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9]))
                && (this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) && (this.GetCardVal(newCards[14]) == this.GetCardVal(newCards[15]))
                && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)
                && (this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1)
                && (this.GetCardCommonVal(newCards[11]) == this.GetCardCommonVal(newCards[12]) + 1)
                && (this.GetCardCommonVal(newCards[13]) == this.GetCardCommonVal(newCards[14]) + 1))
                return  (gameConstDef.CARDS_TYPE.LIAN_DUI_8<<16)+newCards[14];
            return gameConstDef.CARDS_TYPE.NONE;
        }

        if (count == 18)
        {
            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;

            if (((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[1]) == this.GetCardVal(newCards[2])))
                && ((this.GetCardVal(newCards[3]) == this.GetCardVal(newCards[4])) && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])))
                && ((this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[7]) == this.GetCardVal(newCards[8])))
                && ((this.GetCardVal(newCards[9]) == this.GetCardVal(newCards[10])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11])))
                && ((this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) && (this.GetCardVal(newCards[13]) == this.GetCardVal(newCards[14])))
                && ((this.GetCardVal(newCards[15]) == this.GetCardVal(newCards[16])) && (this.GetCardVal(newCards[16]) == this.GetCardVal(newCards[17]))))
            {
                if (((this.GetCardCommonVal(newCards[2]) == this.GetCardCommonVal(newCards[3]) + 1))
                    && ((this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1))
                    && ((this.GetCardCommonVal(newCards[8]) == this.GetCardCommonVal(newCards[9]) + 1))
                    && ((this.GetCardCommonVal(newCards[11]) == this.GetCardCommonVal(newCards[12]) + 1))
                    && ((this.GetCardCommonVal(newCards[14]) == this.GetCardCommonVal(newCards[15]) + 1)))
                    return  (gameConstDef.CARDS_TYPE.LIAN_SHUN_6<<16)+newCards[15];
                return gameConstDef.CARDS_TYPE.NONE;
            }

            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11]))
                && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9]))
                && (this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) && (this.GetCardVal(newCards[14]) == this.GetCardVal(newCards[15])) && (this.GetCardVal(newCards[16]) == this.GetCardVal(newCards[17]))
                && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)
                && (this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1)
                && (this.GetCardCommonVal(newCards[11]) == this.GetCardCommonVal(newCards[12]) + 1)
                && (this.GetCardCommonVal(newCards[13]) == this.GetCardCommonVal(newCards[14]) + 1)
                && (this.GetCardCommonVal(newCards[15]) == this.GetCardCommonVal(newCards[16]) + 1))
                return( gameConstDef.CARDS_TYPE.LIAN_DUI_9 <<16)+newCards[16];

            return gameConstDef.CARDS_TYPE.NONE;
        }

        if(count == 20)
        {
            if (this.GetCardCommonVal(newCards[0]) >= 13) return gameConstDef.CARDS_TYPE.NONE;
            if ((this.GetCardVal(newCards[0]) == this.GetCardVal(newCards[1])) && (this.GetCardVal(newCards[2]) == this.GetCardVal(newCards[3])) && (this.GetCardVal(newCards[10]) == this.GetCardVal(newCards[11]))
                && (this.GetCardVal(newCards[4]) == this.GetCardVal(newCards[5])) && (this.GetCardVal(newCards[6]) == this.GetCardVal(newCards[7])) && (this.GetCardVal(newCards[8]) == this.GetCardVal(newCards[9]))
                && (this.GetCardVal(newCards[12]) == this.GetCardVal(newCards[13])) && (this.GetCardVal(newCards[14]) == this.GetCardVal(newCards[15])) && (this.GetCardVal(newCards[16]) == this.GetCardVal(newCards[17]))
                && (this.GetCardVal(newCards[18]) == this.GetCardVal(newCards[19]))
                && (this.GetCardCommonVal(newCards[1]) == this.GetCardCommonVal(newCards[2]) + 1)
                && (this.GetCardCommonVal(newCards[3]) == this.GetCardCommonVal(newCards[4]) + 1)
                && (this.GetCardCommonVal(newCards[5]) == this.GetCardCommonVal(newCards[6]) + 1)
                && (this.GetCardCommonVal(newCards[7]) == this.GetCardCommonVal(newCards[8]) + 1)
                && (this.GetCardCommonVal(newCards[9]) == this.GetCardCommonVal(newCards[10]) + 1)
                && (this.GetCardCommonVal(newCards[11]) == this.GetCardCommonVal(newCards[12]) + 1)
                && (this.GetCardCommonVal(newCards[13]) == this.GetCardCommonVal(newCards[14]) + 1)
                && (this.GetCardCommonVal(newCards[15]) == this.GetCardCommonVal(newCards[16]) + 1)
                && (this.GetCardCommonVal(newCards[17]) == this.GetCardCommonVal(newCards[18]) + 1))
                return  (gameConstDef.CARDS_TYPE.LIAN_DUI_10<<16)+newCards[18];

            return gameConstDef.CARDS_TYPE.NONE;
        }
        return gameConstDef.CARDS_TYPE.NONE;
    },

    CardsCompare:function(puke1,puke2)
    {
        let nTypeVal1 = this.CheckCardsValid(puke1);
        let nTypeVal2 = this.CheckCardsValid(puke2);
        let  nType1 = nTypeVal1 >> 16;
        let  nType2 = nTypeVal2 >> 16;
        let  nVal1 = this.GetCardCommonVal(nTypeVal1 & 0xFF);
        let  nVal2 = this.GetCardCommonVal(nTypeVal2 & 0xFF);

        if (nType1 == gameConstDef.CARDS_TYPE.ROCKET) return 1;
        if (nType2 == gameConstDef.CARDS_TYPE.ROCKET) return -1;

        if ((nType1 == gameConstDef.CARDS_TYPE.BOMB) && (nType2 != gameConstDef.CARDS_TYPE.BOMB)) return 1;
        if ((nType1 != gameConstDef.CARDS_TYPE.BOMB) && (nType2 == gameConstDef.CARDS_TYPE.BOMB)) return -1;
        
        if (nType1 != nType2) return 1; 

        if (nVal1 > nVal2) return 1;
        if (nVal1 < nVal2) return -1;

        return 0;
    },
    BeatCardsCobmbiles:function(puke1,puke2)     // puke1 当前出的牌    puke2 手中所有牌
    {
        if(puke2.length == 0) return 0;
        let nTypeVal = this.CheckCardsValid(puke1); 
        let nType = nTypeVal >> 16;

        let canBeatArr = [];
        if(nType == gameConstDef.CARDS_TYPE.ROCKET )return canBeatArr;

        let puke = this.OrderPuke(puke2);
        let combiles = this.GetCardsCombile(puke,nType);
        
        for(let i=combiles.length-1;i>=0;i--)
        {
            if(this.CardsCompare(combiles[i],puke1) == 1)
            {
                canBeatArr.push(combiles[i])
            };
        }
        if(nType != gameConstDef.CARDS_TYPE.BOMB )
        {
            let bombCombiles = this.GetCardsCombile(puke,gameConstDef.CARDS_TYPE.BOMB);
            for(let j=0;j<bombCombiles.length;j++)
            {
                canBeatArr.push(bombCombiles[j]);
            }
        }
        let rocketCombiles = this.GetCardsCombile(puke,gameConstDef.CARDS_TYPE.ROCKET);
        if(rocketCombiles.length>0)canBeatArr.push(rocketCombiles[0]);
        return canBeatArr;
    },

    GetCardsTypeXX:function(puke)
    {
        let allXX = [];
        if(puke.length < 2) return allXX;

        for(let i=0;i<puke.length-1;i++)
        {
            if(i>0 && this.GetCardVal(puke[i-1]) == this.GetCardVal(puke[i])) continue;
            if(this.GetCardVal(puke[i]) == this.GetCardVal(puke[i+1]))
            {
                let item = [];
                item.push(puke[i]);
                item.push(puke[i+1]);
                allXX.push(item);
            }
        }
        return allXX;

    },
    GetCardsTypeXXX:function(puke)
    {
        let allXXX = [];
        if(puke.length < 3) return allXXX;

        for(let i=0;i<puke.length-2;i++)
        {
            if(i>0 && this.GetCardVal(puke[i-1]) == this.GetCardVal(puke[i])) continue;
            if(this.GetCardVal(puke[i]) == this.GetCardVal(puke[i+2]))
            {
                let item = [];
                item.push(puke[i]);
                item.push(puke[i+1]);
                item.push(puke[i+2]);
                allXXX.push(item);
            }
        }
        return allXXX;
    },
    GetCardsCombile:function(puke,type)
    {
        let pukeCombile = [];
        switch(type)
        {   
            case gameConstDef.CARDS_TYPE.TYPE_X:
            {
                for(var k in puke)
                {
                    let item = [];
                    item.push(puke[k]);
                    pukeCombile.push(item);
                }
                break
            }
            case gameConstDef.CARDS_TYPE.TYPE_XX:
            {
                if(puke.length < 2)break;
                pukeCombile = this.GetCardsTypeXX(puke);
                break; 
            }

            case gameConstDef.CARDS_TYPE.TYPE_XXX:
            {
                if(puke.length < 3)break;
                pukeCombile = this.GetCardsTypeXXX(puke);  
                break;            
            }
            case gameConstDef.CARDS_TYPE.LIAN_DUI_3:
            {
                if(puke.length < 6)break;
                
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length < 3)break;

                for(let i=0;i<allXX.length-2;i++)
                {
                    if (this.GetCardCommonVal(allXX[i][0]) >= 13) continue;
                    if( (this.GetCardCommonVal(allXX[i][0]) == this.GetCardCommonVal(allXX[i+1][0]) + 1)  && (this.GetCardCommonVal(allXX[i+1][0]) == this.GetCardCommonVal(allXX[i+2][0]) + 1) )
                    {
                            let item = [];
                            item.push(allXX[i][0]);
                            item.push(allXX[i][1]);
                            item.push(allXX[i+1][0]);
                            item.push(allXX[i+1][1]);
                            item.push(allXX[i+2][0]);
                            item.push(allXX[i+2][1]);
                            pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_DUI_4:
            {
                if(puke.length < 8)break;
                
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length<4)break;

                for(let i=0;i<allXX.length-3;i++)
                {
                    if (this.GetCardCommonVal(allXX[i][0]) >= 13) continue;
                    if( (this.GetCardCommonVal(allXX[i][0]) == this.GetCardCommonVal(allXX[i+1][0]) + 1)  && (this.GetCardCommonVal(allXX[i+1][0]) == this.GetCardCommonVal(allXX[i+2][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+2][0]) == this.GetCardCommonVal(allXX[i+3][0]) + 1)
                     )
                    {
                            let item = [];
                            item.push(allXX[i][0]);
                            item.push(allXX[i][1]);
                            item.push(allXX[i+1][0]);
                            item.push(allXX[i+1][1]);
                            item.push(allXX[i+2][0]);
                            item.push(allXX[i+2][1]);
                            item.push(allXX[i+3][0]);
                            item.push(allXX[i+3][1]);
                            pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_DUI_5:
            {
                if(puke.length < 10)break;
                
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length<5)break;
                for(let i=0;i<allXX.length-4;i++)
                {
                    if (this.GetCardCommonVal(allXX[i][0]) >= 13) continue;
                    if( (this.GetCardCommonVal(allXX[i][0]) == this.GetCardCommonVal(allXX[i+1][0]) + 1)  && (this.GetCardCommonVal(allXX[i+1][0]) == this.GetCardCommonVal(allXX[i+2][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+2][0]) == this.GetCardCommonVal(allXX[i+3][0]) + 1) && (this.GetCardCommonVal(allXX[i+3][0]) == this.GetCardCommonVal(allXX[i+4][0]) + 1)
                     )
                    {
                            let item = [];
                            item.push(allXX[i][0]);
                            item.push(allXX[i][1]);
                            item.push(allXX[i+1][0]);
                            item.push(allXX[i+1][1]);
                            item.push(allXX[i+2][0]);
                            item.push(allXX[i+2][1]);
                            item.push(allXX[i+3][0]);
                            item.push(allXX[i+3][1]);
                            item.push(allXX[i+4][0]);
                            item.push(allXX[i+4][1]);
                            pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_DUI_6:
            {
                if(puke.length < 12)break;
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length<6)break;
                for(let i=0;i<allXX.length-5;i++)
                {
                    if (this.GetCardCommonVal(allXX[i][0]) >= 13) continue;
                    if( (this.GetCardCommonVal(allXX[i][0]) == this.GetCardCommonVal(allXX[i+1][0]) + 1)  && (this.GetCardCommonVal(allXX[i+1][0]) == this.GetCardCommonVal(allXX[i+2][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+2][0]) == this.GetCardCommonVal(allXX[i+3][0]) + 1) && (this.GetCardCommonVal(allXX[i+3][0]) == this.GetCardCommonVal(allXX[i+4][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+4][0]) == this.GetCardCommonVal(allXX[i+5][0]) + 1)
                     )
                    {
                            let item = [];
                            item.push(allXX[i][0]);
                            item.push(allXX[i][1]);
                            item.push(allXX[i+1][0]);
                            item.push(allXX[i+1][1]);
                            item.push(allXX[i+2][0]);
                            item.push(allXX[i+2][1]);
                            item.push(allXX[i+3][0]);
                            item.push(allXX[i+3][1]);
                            item.push(allXX[i+4][0]);
                            item.push(allXX[i+4][1]);
                            item.push(allXX[i+5][0]);
                            item.push(allXX[i+5][1]);
                            pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_DUI_7:
            {
                if(puke.length < 14)break;
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length<7)break;
                for(let i=0;i<allXX.length-6;i++)
                {
                    if (this.GetCardCommonVal(allXX[i][0]) >= 13) continue;
                    if( (this.GetCardCommonVal(allXX[i][0]) == this.GetCardCommonVal(allXX[i+1][0]) + 1)  && (this.GetCardCommonVal(allXX[i+1][0]) == this.GetCardCommonVal(allXX[i+2][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+2][0]) == this.GetCardCommonVal(allXX[i+3][0]) + 1) && (this.GetCardCommonVal(allXX[i+3][0]) == this.GetCardCommonVal(allXX[i+4][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+4][0]) == this.GetCardCommonVal(allXX[i+5][0]) + 1) && (this.GetCardCommonVal(allXX[i+5][0]) == this.GetCardCommonVal(allXX[i+6][0]) + 1)
                     )
                    {
                            let item = [];
                            item.push(allXX[i][0]);
                            item.push(allXX[i][1]);
                            item.push(allXX[i+1][0]);
                            item.push(allXX[i+1][1]);
                            item.push(allXX[i+2][0]);
                            item.push(allXX[i+2][1]);
                            item.push(allXX[i+3][0]);
                            item.push(allXX[i+3][1]);
                            item.push(allXX[i+4][0]);
                            item.push(allXX[i+4][1]);
                            item.push(allXX[i+5][0]);
                            item.push(allXX[i+5][1]);
                            item.push(allXX[i+6][0]);
                            item.push(allXX[i+6][1]);
                            pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_DUI_8:
            {
                if(puke.length < 16)break;
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length<8)break;
                for(let i=0;i<allXX.length-7;i++)
                {
                    if (this.GetCardCommonVal(allXX[i][0]) >= 13) continue;
                    if( (this.GetCardCommonVal(allXX[i][0]) == this.GetCardCommonVal(allXX[i+1][0]) + 1)  && (this.GetCardCommonVal(allXX[i+1][0]) == this.GetCardCommonVal(allXX[i+2][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+2][0]) == this.GetCardCommonVal(allXX[i+3][0]) + 1) && (this.GetCardCommonVal(allXX[i+3][0]) == this.GetCardCommonVal(allXX[i+4][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+4][0]) == this.GetCardCommonVal(allXX[i+5][0]) + 1) && (this.GetCardCommonVal(allXX[i+5][0]) == this.GetCardCommonVal(allXX[i+6][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+6][0]) == this.GetCardCommonVal(allXX[i+7][0]) + 1)
                     )
                    {
                            let item = [];
                            item.push(allXX[i][0]);
                            item.push(allXX[i][1]);
                            item.push(allXX[i+1][0]);
                            item.push(allXX[i+1][1]);
                            item.push(allXX[i+2][0]);
                            item.push(allXX[i+2][1]);
                            item.push(allXX[i+3][0]);
                            item.push(allXX[i+3][1]);
                            item.push(allXX[i+4][0]);
                            item.push(allXX[i+4][1]);
                            item.push(allXX[i+5][0]);
                            item.push(allXX[i+5][1]);
                            item.push(allXX[i+6][0]);
                            item.push(allXX[i+6][1]);
                            item.push(allXX[i+7][0]);
                            item.push(allXX[i+7][1]);
                            pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_DUI_9:
            {
                if(puke.length < 18)break;
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length<9)break;
                for(let i=0;i<allXX.length-8;i++)
                {
                    if (this.GetCardCommonVal(allXX[i][0]) >= 13) continue;
                    if( (this.GetCardCommonVal(allXX[i][0]) == this.GetCardCommonVal(allXX[i+1][0]) + 1)  && (this.GetCardCommonVal(allXX[i+1][0]) == this.GetCardCommonVal(allXX[i+2][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+2][0]) == this.GetCardCommonVal(allXX[i+3][0]) + 1) && (this.GetCardCommonVal(allXX[i+3][0]) == this.GetCardCommonVal(allXX[i+4][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+4][0]) == this.GetCardCommonVal(allXX[i+5][0]) + 1) && (this.GetCardCommonVal(allXX[i+5][0]) == this.GetCardCommonVal(allXX[i+6][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+6][0]) == this.GetCardCommonVal(allXX[i+7][0]) + 1) && (this.GetCardCommonVal(allXX[i+7][0]) == this.GetCardCommonVal(allXX[i+8][0]) + 1)
                     )
                    {
                            let item = [];
                            item.push(allXX[i][0]);
                            item.push(allXX[i][1]);
                            item.push(allXX[i+1][0]);
                            item.push(allXX[i+1][1]);
                            item.push(allXX[i+2][0]);
                            item.push(allXX[i+2][1]);
                            item.push(allXX[i+3][0]);
                            item.push(allXX[i+3][1]);
                            item.push(allXX[i+4][0]);
                            item.push(allXX[i+4][1]);
                            item.push(allXX[i+5][0]);
                            item.push(allXX[i+5][1]);
                            item.push(allXX[i+6][0]);
                            item.push(allXX[i+6][1]);
                            item.push(allXX[i+7][0]);
                            item.push(allXX[i+7][1]);
                            item.push(allXX[i+8][0]);
                            item.push(allXX[i+8][1]);
                            pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_DUI_10:
            {
                if(puke.length < 20)break;
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length<10)break;
                for(let i=0;i<allXX.length-9;i++)
                {
                    if (this.GetCardCommonVal(allXX[i][0]) >= 13) continue;
                    if( (this.GetCardCommonVal(allXX[i][0]) == this.GetCardCommonVal(allXX[i+1][0]) + 1)  && (this.GetCardCommonVal(allXX[i+1][0]) == this.GetCardCommonVal(allXX[i+2][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+2][0]) == this.GetCardCommonVal(allXX[i+3][0]) + 1) && (this.GetCardCommonVal(allXX[i+3][0]) == this.GetCardCommonVal(allXX[i+4][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+4][0]) == this.GetCardCommonVal(allXX[i+5][0]) + 1) && (this.GetCardCommonVal(allXX[i+5][0]) == this.GetCardCommonVal(allXX[i+6][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+6][0]) == this.GetCardCommonVal(allXX[i+7][0]) + 1) && (this.GetCardCommonVal(allXX[i+7][0]) == this.GetCardCommonVal(allXX[i+8][0]) + 1)
                    && (this.GetCardCommonVal(allXX[i+8][0]) == this.GetCardCommonVal(allXX[i+9][0]) + 1)
                     )
                    {
                            let item = [];
                            item.push(allXX[i][0]);
                            item.push(allXX[i][1]);
                            item.push(allXX[i+1][0]);
                            item.push(allXX[i+1][1]);
                            item.push(allXX[i+2][0]);
                            item.push(allXX[i+2][1]);
                            item.push(allXX[i+3][0]);
                            item.push(allXX[i+3][1]);
                            item.push(allXX[i+4][0]);
                            item.push(allXX[i+4][1]);
                            item.push(allXX[i+5][0]);
                            item.push(allXX[i+5][1]);
                            item.push(allXX[i+6][0]);
                            item.push(allXX[i+6][1]);
                            item.push(allXX[i+7][0]);
                            item.push(allXX[i+7][1]);
                            item.push(allXX[i+8][0]);
                            item.push(allXX[i+8][1]);
                            item.push(allXX[i+9][0]);
                            item.push(allXX[i+9][1]);
                            pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_SHUN_2:
            {
                if(puke.length < 6) break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<2)break;
                for(let i=0;i<allXXX.length-1;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if(this.GetCardCommonVal(allXXX[i][0]) == (this.GetCardCommonVal(allXXX[i+1][0]) + 1))
                    {
                        let item = [];
                        item.push(allXXX[i][0]);
                        item.push(allXXX[i][1]);
                        item.push(allXXX[i][2]);
                        item.push(allXXX[i+1][0]);
                        item.push(allXXX[i+1][1]);
                        item.push(allXXX[i+1][2]);
                        pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_SHUN_3:
            {
                if(puke.length < 9) break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<3)break;
                for(let i=0;i<allXXX.length-2;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if(this.GetCardCommonVal(allXXX[i][0]) == (this.GetCardCommonVal(allXXX[i+1][0]) + 1) && this.GetCardCommonVal(allXXX[i+1][0]) == (this.GetCardCommonVal(allXXX[i+2][0]) + 1))
                    {
                        let item = [];
                        item.push(allXXX[i][0]);
                        item.push(allXXX[i][1]);
                        item.push(allXXX[i][2]);
                        item.push(allXXX[i+1][0]);
                        item.push(allXXX[i+1][1]);
                        item.push(allXXX[i+1][2]);
                        item.push(allXXX[i+2][0]);
                        item.push(allXXX[i+2][1]);
                        item.push(allXXX[i+2][2]);
                        pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_SHUN_4:
            {
                if(puke.length < 12) break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<4)break;
                for(let i=0;i<allXXX.length-3;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if(this.GetCardCommonVal(allXXX[i][0]) == (this.GetCardCommonVal(allXXX[i+1][0]) + 1) && this.GetCardCommonVal(allXXX[i+1][0]) == (this.GetCardCommonVal(allXXX[i+2][0]) + 1)
                    && this.GetCardCommonVal(allXXX[i+2][0]) == (this.GetCardCommonVal(allXXX[i+3][0]) + 1)
                    )
                    {
                        let item = [];
                        item.push(allXXX[i][0]);
                        item.push(allXXX[i][1]);
                        item.push(allXXX[i][2]);
                        item.push(allXXX[i+1][0]);
                        item.push(allXXX[i+1][1]);
                        item.push(allXXX[i+1][2]);
                        item.push(allXXX[i+2][0]);
                        item.push(allXXX[i+2][1]);
                        item.push(allXXX[i+2][2]);
                        item.push(allXXX[i+3][0]);
                        item.push(allXXX[i+3][1]);
                        item.push(allXXX[i+3][2]);
                        pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_SHUN_5:
            {
                if(puke.length < 15) break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<4)break;
                for(let i=0;i<allXXX.length-4;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if(this.GetCardCommonVal(allXXX[i][0]) == (this.GetCardCommonVal(allXXX[i+1][0]) + 1) && this.GetCardCommonVal(allXXX[i+1][0]) == (this.GetCardCommonVal(allXXX[i+2][0]) + 1)
                    && this.GetCardCommonVal(allXXX[i+2][0]) == (this.GetCardCommonVal(allXXX[i+3][0]) + 1) && this.GetCardCommonVal(allXXX[i+3][0]) == (this.GetCardCommonVal(allXXX[i+4][0]) + 1)
                    )
                    {
                        let item = [];
                        item.push(allXXX[i][0]);
                        item.push(allXXX[i][1]);
                        item.push(allXXX[i][2]);
                        item.push(allXXX[i+1][0]);
                        item.push(allXXX[i+1][1]);
                        item.push(allXXX[i+1][2]);
                        item.push(allXXX[i+2][0]);
                        item.push(allXXX[i+2][1]);
                        item.push(allXXX[i+2][2]);
                        item.push(allXXX[i+3][0]);
                        item.push(allXXX[i+3][1]);
                        item.push(allXXX[i+3][2]);
                        item.push(allXXX[i+4][0]);
                        item.push(allXXX[i+4][1]);
                        item.push(allXXX[i+4][2]);
                        pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.LIAN_SHUN_6:
            {
                if(puke.length < 18) break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<5)break;
                for(let i=0;i<allXXX.length-5;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if(this.GetCardCommonVal(allXXX[i][0]) == (this.GetCardCommonVal(allXXX[i+1][0]) + 1) && this.GetCardCommonVal(allXXX[i+1][0]) == (this.GetCardCommonVal(allXXX[i+2][0]) + 1)
                    && this.GetCardCommonVal(allXXX[i+2][0]) == (this.GetCardCommonVal(allXXX[i+3][0]) + 1) && this.GetCardCommonVal(allXXX[i+3][0]) == (this.GetCardCommonVal(allXXX[i+4][0]) + 1)
                    && this.GetCardCommonVal(allXXX[i+4][0]) == (this.GetCardCommonVal(allXXX[i+5][0]) + 1)
                    )
                    {
                        let item = [];
                        item.push(allXXX[i][0]);
                        item.push(allXXX[i][1]);
                        item.push(allXXX[i][2]);
                        item.push(allXXX[i+1][0]);
                        item.push(allXXX[i+1][1]);
                        item.push(allXXX[i+1][2]);
                        item.push(allXXX[i+2][0]);
                        item.push(allXXX[i+2][1]);
                        item.push(allXXX[i+2][2]);
                        item.push(allXXX[i+3][0]);
                        item.push(allXXX[i+3][1]);
                        item.push(allXXX[i+3][2]);
                        item.push(allXXX[i+4][0]);
                        item.push(allXXX[i+4][1]);
                        item.push(allXXX[i+4][2]);
                        item.push(allXXX[i+5][0]);
                        item.push(allXXX[i+5][1]);
                        item.push(allXXX[i+5][2]);
                        pukeCombile.push(item);
                    }
                }
                break;
            }

            case gameConstDef.CARDS_TYPE.PLANE_S_1:
            {
                if(puke.length < 4)break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<1)break;

                for(let i=0;i<allXXX.length;i++)
                {
                    for(let j=0;j<puke.length;j++)
                    {
                        if(this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i][0]))continue;
                        let item = [];
                        item.push(allXXX[i][0]);
                        item.push(allXXX[i][1]);
                        item.push(allXXX[i][2]);
                        item.push(puke[j]);
                        pukeCombile.push(item);
                    }
                }                    
                break;  
            }
            case gameConstDef.CARDS_TYPE.PLANE_S_2:
            {
                if(puke.length < 8)break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<2)break;
                for(let i=0;i<allXXX.length-1;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if(this.GetCardCommonVal(allXXX[i][0]) !== (this.GetCardCommonVal(allXXX[i+1][0]) + 1))continue;
                    for(let j=0;j<puke.length;j++)
                    {
                        if(this.GetCardVal( puke[j]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal( puke[j]) == this.GetCardVal(allXXX[i+1][0]))continue;                           
                        for(let k=0;k<puke.length;k++)
                        {
                            if(this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[k]) != this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[k]) == this.GetCardVal(puke[j]))continue;
                            let item = [];
                            item.push(allXXX[i][0]);
                            item.push(allXXX[i][1]);
                            item.push(allXXX[i][2]);
                            item.push(allXXX[i+1][0]);
                            item.push(allXXX[i+1][1]);
                            item.push(allXXX[i+1][2]);
                            item.push(puke[j]);
                            item.push(puke[k]);
                            pukeCombile.push(item);
                        }
                    }
                }
                break; 
            }
            case gameConstDef.CARDS_TYPE.PLANE_S_3:
            {
                if(puke.length < 12)break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<3)break;
                for(let i=0;i<allXXX.length-2;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if(this.GetCardCommonVal(allXXX[i][0]) !== (this.GetCardCommonVal(allXXX[i+1][0]) + 1) || this.GetCardCommonVal(allXXX[i+1][0]) !== (this.GetCardCommonVal(allXXX[i+2][0]) + 1))continue;
                    for(let j=0;j<puke.length;j++)
                    {
                        if(this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+2][0]) )continue;
                        for(let k=0;k<puke.length;k++)
                        {
                            if(this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+2][0]) || this.GetCardVal(puke[j]) == this.GetCardVal(puke[k]))
                            for(let m=0;m<puke.length;m++)
                            {
                                if(this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+2][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(puke[k]) 
                                || this.GetCardVal(puke[m]) == this.GetCardVal(puke[j]))continue;
                                let item = [];
                                item.push(allXXX[i][0]);
                                item.push(allXXX[i][1]);
                                item.push(allXXX[i][2]);
                                item.push(allXXX[i+1][0]);
                                item.push(allXXX[i+1][1]);
                                item.push(allXXX[i+1][2]);
                                item.push(allXXX[i+2][0]);
                                item.push(allXXX[i+2][1]);
                                item.push(allXXX[i+2][2]);
                                item.push(puke[j]);
                                item.push(puke[k]);
                                item.push(puke[m]);
                                pukeCombile.push(item);
                            }
                        }
                    }
                }
                break;   
            }
            case gameConstDef.CARDS_TYPE.PLANE_S_4:
            {
                if(puke.length < 16)break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<4)break;
                for(let i=0;i<allXXX.length-3;i++)
                {
                     if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                     if(this.GetCardCommonVal(allXXX[i][0]) !== (this.GetCardCommonVal(allXXX[i+1][0]) + 1) 
                     || this.GetCardCommonVal(allXXX[i+1][0]) !== (this.GetCardCommonVal(allXXX[i+2][0]) + 1) || this.GetCardCommonVal(allXXX[i+2][0]) !== (this.GetCardCommonVal(allXXX[i+3][0]) + 1)
                     )continue;
                    for(let j=0;j<puke.length;j++)
                    {
                        if(this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+1][0])
                        || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+2][0])  || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+3][0]))continue;
                        for(let k=0;k<puke.length;k++)
                        {
                            if(this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+1][0])
                             || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+2][0]) || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+3][0]) || this.GetCardVal(puke[j]) == this.GetCardVal(puke[k]))continue;
                            for(let m=0;m<puke.length;m++)
                            {
                                if(this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+2][0])
                                || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+3][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(puke[k]) || this.GetCardVal(puke[m]) == this.GetCardVal(puke[j]))continue;
                                for(let n=0;n<puke.length;n++)
                                {
                                    if(this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i+1][0]) 
                                    || this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i+2][0]) || this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i+3][0]) 
                                    || this.GetCardVal(puke[n]) == this.GetCardVal(puke[m]) || this.GetCardVal(puke[n]) == this.GetCardVal(puke[j]) || this.GetCardVal(puke[n]) == this.GetCardVal(puke[k]))continue;
                                    {
                                    let item = [];
                                    item.push(allXXX[i][0]);
                                    item.push(allXXX[i][1]);
                                    item.push(allXXX[i][2]);
                                    item.push(allXXX[i+1][0]);
                                    item.push(allXXX[i+1][1]);
                                    item.push(allXXX[i+1][2]);
                                    item.push(allXXX[i+2][0]);
                                    item.push(allXXX[i+2][1]);
                                    item.push(allXXX[i+2][2]);
                                    item.push(allXXX[i+3][0]);
                                    item.push(allXXX[i+3][1]);
                                    item.push(allXXX[i+3][2]);
                                    item.push(puke[j]);
                                    item.push(puke[k]);
                                    item.push(puke[m]);
                                    item.push(puke[n]);
                                    pukeCombile.push(item);
                                    }
                                }
                                    
                            }
                        }
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.PLANE_S_5:
            {
                if(puke.length < 20)break;
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXXX.length<5)break;
                for(let i=0;i<allXXX.length;i++)
                {
                     if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                     if(this.GetCardCommonVal(allXXX[i][0]) !== (this.GetCardCommonVal(allXXX[i+1][0]) + 1)  || this.GetCardCommonVal(allXXX[i+1][0]) !== (this.GetCardCommonVal(allXXX[i+2][0]) + 1)
                     || this.GetCardCommonVal(allXXX[i+2][0]) !== (this.GetCardCommonVal(allXXX[i+3][0]) + 1) || this.GetCardCommonVal(allXXX[i+3][0]) !== (this.GetCardCommonVal(allXXX[i+4][0]) + 1))continue;
                    for(let j=0;j<puke.length;j++)
                    {
                        if(this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+1][0]) 
                        || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+2][0]) || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+3][0])  || this.GetCardVal(puke[j]) == this.GetCardVal(allXXX[i+4][0]) )continue;
                        for(let k=0;k<puke.length;k++)
                        {
                            if(this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+2][0]) 
                            || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+3][0]) || this.GetCardVal(puke[k]) == this.GetCardVal(allXXX[i+4][0]) || this.GetCardVal(puke[j]) == this.GetCardVal(puke[k]))continue;
                            for(let m=0;m<puke.length;m++)
                            {
                                if(this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+2][0]) 
                                || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+3][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(allXXX[i+4][0]) || this.GetCardVal(puke[m]) == this.GetCardVal(puke[k]) || this.GetCardVal(puke[m]) == this.GetCardVal(puke[j]))continue;
                                for(let n=0;n<puke.length;n++)
                                {
                                    if(this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i+2][0])
                                    || this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i+3][0]) || this.GetCardVal(puke[n]) == this.GetCardVal(allXXX[i+4][0]) 
                                    || this.GetCardVal(puke[n]) == this.GetCardVal(puke[m]) || this.GetCardVal(puke[n]) == this.GetCardVal(puke[j]) || this.GetCardVal(puke[n]) == this.GetCardVal(puke[k]) 
                                    )continue;
                                    for(let t=0;t<puke.length;t++)
                                    {
                                        if(this.GetCardVal(puke[t]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(puke[t]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(puke[t]) == this.GetCardVal(allXXX[i+2][0])
                                        || this.GetCardVal(puke[t]) == this.GetCardVal(allXXX[i+3][0]) || this.GetCardVal(puke[t]) == this.GetCardVal(allXXX[i+4][0]) || this.GetCardVal(puke[t]) == this.GetCardVal(puke[j]) 
                                        || this.GetCardVal(puke[t]) == this.GetCardVal(puke[k]) || this.GetCardVal(puke[t]) == this.GetCardVal(puke[m]) || this.GetCardVal(puke[t]) == this.GetCardVal(puke[n]))continue;
                                        let item = [];
                                        item.push(allXXX[i][0]);
                                        item.push(allXXX[i][1]);
                                        item.push(allXXX[i][2]);
                                        item.push(allXXX[i+1][0]);
                                        item.push(allXXX[i+1][1]);
                                        item.push(allXXX[i+1][2]);
                                        item.push(allXXX[i+2][0]);
                                        item.push(allXXX[i+2][1]);
                                        item.push(allXXX[i+2][2]);
                                        item.push(allXXX[i+3][0]);
                                        item.push(allXXX[i+3][1]);
                                        item.push(allXXX[i+3][2]);
                                        item.push(allXXX[i+4][0]);
                                        item.push(allXXX[i+4][1]);
                                        item.push(allXXX[i+4][2]);
                                        item.push(puke[j]);
                                        item.push(puke[k]);
                                        item.push(puke[m]);
                                        item.push(puke[n]);
                                        item.push(puke[t]);
                                        pukeCombile.push(item);
                                    }
                                }
                            }
                        }
                    }
                     
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.PLANE_B_1:
            {
                if(puke.length<5)break;

                let allXX = this.GetCardsTypeXX(puke);
                let allXXX = this.GetCardsTypeXXX(puke);
                if(allXX.length<2 || allXXX.length<1)break;

                for(let i=0;i<allXXX.length;i++)
                {
                    for(let j=0;j<allXX.length;j++)
                    {
                        if(this.GetCardVal(allXX[j][0]) != this.GetCardVal(allXXX[i][0]))
                        {
                            let item = [];
                            item.push(allXXX[i][0]);
                            item.push(allXXX[i][1]);
                            item.push(allXXX[i][2]);
                            item.push(allXX[j][0]);
                            item.push(allXX[j][1]);
                            pukeCombile.push(item); 
                        }
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.PLANE_B_2:
            {
                if(puke.length<10)break;

                let allXX = this.GetCardsTypeXX(puke);
                let allXXX = this.GetCardsTypeXXX(puke);

                if(allXX.length<4 || allXXX.length<2)break;
                for(let i=0;i<allXXX.length-1;i++)
                {
                   if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                   if(this.GetCardCommonVal(allXXX[i][0]) != this.GetCardCommonVal(allXXX[i+1][0]) +1)continue;

                   for(let j=0;j<allXX.length;j++)
                   {
                       if(this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i+1][0]))continue;
                       for(let k=0;k<allXX.length;k++)
                       {
                           if(this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXX[j][0]))continue;
                           let item = [];
                           item.push(allXXX[i][0]);
                           item.push(allXXX[i][1]);
                           item.push(allXXX[i][2]);
                           item.push(allXXX[i+1][0]);
                           item.push(allXXX[i+1][1]);
                           item.push(allXXX[i+1][2]);
                           item.push(allXXX[j][0]);
                           item.push(allXXX[j][1]);
                           item.push(allXXX[k][0]);
                           item.push(allXXX[k][1]);
                           pukeCombile.push(item); 
                      }
                   }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.PLANE_B_3:
            {
                if(puke.length<15)break;

                let allXX = this.GetCardsTypeXX(puke);
                let allXXX = this.GetCardsTypeXXX(puke);

                if(allXX.length<6 || allXXX.length<3)break;
                for(let i=0;i<allXXX.length-2;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if((this.GetCardCommonVal(allXXX[i][0]) != this.GetCardCommonVal(allXXX[i+1][0]) +1) || (this.GetCardCommonVal(allXXX[i+1][0]) != this.GetCardCommonVal(allXXX[i+2][0]) +1))
                    continue;
                    for(let j=0;j<allXX.length;j++)
                    {
                        if(this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i+2][0])  )continue;
                        for(let k=0;k<allXX.length;k++)
                        {
                            if(this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i+1][0]) 
                            || this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i+2][0]) ||  this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXX[j][0])
                            )continue;
                            for(let t=0;t<allXX.length;t++)
                            {
                                if(this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXXX[i+1][0]) 
                                || this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXXX[i+2][0]) ||  this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXX[j][0]) ||  this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXX[k][0])
                                )continue;
                                let item = [];
                                item.push(allXXX[i][0]);
                                item.push(allXXX[i][1]);
                                item.push(allXXX[i][2]);
                                item.push(allXXX[i+1][0]);
                                item.push(allXXX[i+1][1]);
                                item.push(allXXX[i+1][2]);
                                item.push(allXXX[i+2][0]);
                                item.push(allXXX[i+2][1]);
                                item.push(allXXX[i+2][2]);
                                item.push(allXXX[j][0]);
                                item.push(allXXX[j][1]);
                                item.push(allXXX[k][0]);
                                item.push(allXXX[k][1]);
                                item.push(allXXX[t][0]);
                                item.push(allXXX[t][1]);
                                pukeCombile.push(item); 
                                
                            }
                        }
                    }
                }

            }
            case gameConstDef.CARDS_TYPE.PLANE_B_3:
            {
                if(puke.length<18)break;

                let allXX = this.GetCardsTypeXX(puke);
                let allXXX = this.GetCardsTypeXXX(puke);

                if(allXX.length<8 || allXXX.length<4)break;
                for(let i=0;i<allXXX.length-3;i++)
                {
                    if(this.GetCardCommonVal(allXXX[i][0]) >= 13 )continue;
                    if((this.GetCardCommonVal(allXXX[i][0]) != this.GetCardCommonVal(allXXX[i+1][0]) +1) || (this.GetCardCommonVal(allXXX[i+1][0]) != this.GetCardCommonVal(allXXX[i+2][0]) +1)
                    || (this.GetCardCommonVal(allXXX[i+2][0]) != this.GetCardCommonVal(allXXX[i+3][0]) +1) )continue;
                   for(let j=0;j<allXX.length;j++)
                   {
                       if(this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i+1][0]) 
                       || this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i+2][0]) || this.GetCardVal(allXX[j][0]) == this.GetCardVal(allXXX[i+3][0])  )continue;
                       for(let k=0;k<allXX.length;k++)
                       {
                            if(this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i+1][0])  || this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i+2][0]) 
                            || this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXXX[i+3][0]) ||  this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXX[j][0])
                            )continue;
                            for(let t=0;t<allXX.length;t++)
                            {
                                if(this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXXX[i+2][0])
                                || this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXXX[i+3][0]) ||  this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXX[j][0]) ||  this.GetCardVal(allXX[t][0]) == this.GetCardVal(allXX[k][0])
                                )continue;
                                for(let m=0;m<allXX.length;m++)
                                {
                                    if(this.GetCardVal(allXX[m][0]) == this.GetCardVal(allXXX[i][0]) || this.GetCardVal(allXX[m][0]) == this.GetCardVal(allXXX[i+1][0]) || this.GetCardVal(allXX[m][0]) == this.GetCardVal(allXXX[i+2][0])
                                    || this.GetCardVal(allXX[m][0]) == this.GetCardVal(allXXX[i+3][0]) ||  this.GetCardVal(allXX[m][0]) == this.GetCardVal(allXX[j][0]) ||  this.GetCardVal(allXX[m][0]) == this.GetCardVal(allXX[k][0])
                                    ||  this.GetCardVal(allXX[m][0]) == this.GetCardVal(allXX[t][0]))continue;
                                    let item = [];
                                    item.push(allXXX[i][0]);
                                    item.push(allXXX[i][1]);
                                    item.push(allXXX[i][2]);
                                    item.push(allXXX[i+1][0]);
                                    item.push(allXXX[i+1][1]);
                                    item.push(allXXX[i+1][2]);
                                    item.push(allXXX[i+2][0]);
                                    item.push(allXXX[i+2][1]);
                                    item.push(allXXX[i+2][2]);
                                    item.push(allXXX[i+3][0]);
                                    item.push(allXXX[i+3][1]);
                                    item.push(allXXX[i+3][2]);
                                    item.push(allXXX[j][0]);
                                    item.push(allXXX[j][1]);
                                    item.push(allXXX[k][0]);
                                    item.push(allXXX[k][1]);
                                    item.push(allXXX[t][0]);
                                    item.push(allXXX[t][1]);
                                    item.push(allXXX[m][0]);
                                    item.push(allXXX[m][1]);
                                    pukeCombile.push(item); 
                                }
                            }
                       }
                   }
                    
                }
            }
            case gameConstDef.CARDS_TYPE.SHUNZI_5:
            {
                if(puke.length<5) break; 
                for(let i=0;i<puke.length-4;i++)
                {
                    let firstVal = this.GetCardCommonVal(puke[i]); 
                    if (firstVal >= 13) continue;
                    let isExist1 = 0;
                    let isExist2 = 0;
                    let isExist3 = 0;
                    let isExist4 = 0;
                    let j=0;
                    while(j<puke.length)
                    {
                        if(firstVal == this.GetCardCommonVal(puke[j])+1){isExist1=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+2){isExist2=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+3){isExist3=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+4){isExist4=j;j++;continue;}
                        j++;
                    }
                    if(isExist1>0 && isExist2>0 && isExist3>0 && isExist4>0)
                    {
                        let item = [];
                        item.push(puke[i]);
                        item.push(puke[isExist1]);
                        item.push(puke[isExist2]);
                        item.push(puke[isExist3]);
                        item.push(puke[isExist4]);
                        pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.SHUNZI_6:
            {
                if(puke.length<6)break; 
                for(let i=0;i<puke.length-5;i++)
                {
                    let firstVal = this.GetCardCommonVal(puke[i]); 
                    if (firstVal >= 13) continue;
                    let isExist1 = 0;let isExist2 = 0;
                    let isExist3 = 0;let isExist4 = 0;
                    let isExist5 = 0;
                    let j=0;
                    while(j<puke.length)
                    {
                        if(firstVal == this.GetCardCommonVal(puke[j])+1){isExist1=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+2){isExist2=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+3){isExist3=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+4){isExist4=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+5){isExist5=j;j++;continue;}
                        j++;
                    }
                    if(isExist1>0 && isExist2>0 && isExist3>0 && isExist4>0 && isExist5>0)
                    {
                        let item = [];
                        item.push(puke[i]);
                        item.push(puke[isExist1]);
                        item.push(puke[isExist2]);
                        item.push(puke[isExist3]);
                        item.push(puke[isExist4]);
                        item.push(puke[isExist5]);
                        pukeCombile.push(item);
                    }
                }
                break; 
            }
            case gameConstDef.CARDS_TYPE.SHUNZI_7:
            {
                if(puke.length<7)break; 
                for(let i=0;i<puke.length-6;i++)
                {
                    let firstVal = this.GetCardCommonVal(puke[i]); 
                    if (firstVal >= 13) continue;
                    let isExist1 = 0;let isExist2 = 0;
                    let isExist3 = 0;let isExist4 = 0;
                    let isExist5 = 0;let isExist6 = 0;
                    let j=0;
                    while(j<puke.length)
                    {
                        if(firstVal == this.GetCardCommonVal(puke[j])+1){isExist1=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+2){isExist2=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+3){isExist3=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+4){isExist4=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+5){isExist5=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+6){isExist6=j;j++;continue;}
                        j++;
                    }
                    if(isExist1>0 && isExist2>0 && isExist3>0 && isExist4>0 && isExist5>0 && isExist6>0)
                    {
                        let item = [];
                        item.push(puke[i]);
                        item.push(puke[isExist1]);
                        item.push(puke[isExist2]);
                        item.push(puke[isExist3]);
                        item.push(puke[isExist4]);
                        item.push(puke[isExist5]);
                        item.push(puke[isExist6]);
                        pukeCombile.push(item);
                    }
                }
                break; 
            }
            case gameConstDef.CARDS_TYPE.SHUNZI_8:
            {
                if(puke.length<8) break; 
                for(let i=0;i<puke.length-7;i++)
                {
                    let firstVal = this.GetCardCommonVal(puke[i]); 
                    if (firstVal >= 13) continue;
                    let isExist1 = 0;let isExist2 = 0;
                    let isExist3 = 0;let isExist4 = 0;
                    let isExist5 = 0;let isExist6 = 0;let isExist7 = 0;
                    let j=0;
                    while(j<puke.length)
                    {
                        if(firstVal == this.GetCardCommonVal(puke[j])+1){isExist1=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+2){isExist2=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+3){isExist3=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+4){isExist4=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+5){isExist5=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+6){isExist6=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+7){isExist7=j;j++;continue;}
                        j++;
                    }
                    if(isExist1>0 && isExist2>0 && isExist3>0 && isExist4>0 && isExist5>0 && isExist6>0 && isExist7>0)
                    {
                        let item = [];
                        item.push(puke[i]);
                        item.push(puke[isExist1]);
                        item.push(puke[isExist2]);
                        item.push(puke[isExist3]);
                        item.push(puke[isExist4]);
                        item.push(puke[isExist5]);
                        item.push(puke[isExist6]);
                        item.push(puke[isExist7]);
                        pukeCombile.push(item);
                    }
                }
                break; 
            }
            case gameConstDef.CARDS_TYPE.SHUNZI_9:
            {
                if(puke.length<9)break; 
                for(let i=0;i<puke.length-8;i++)
                {
                    let firstVal = this.GetCardCommonVal(puke[i]); 
                    if (firstVal >= 13) continue;
                    let isExist1 = 0;let isExist2 = 0;let isExist3 = 0;
                    let isExist4 = 0;let isExist5 = 0;let isExist6 = 0;
                    let isExist7 = 0;let isExist8 = 0;
                    let j=0;
                    while(j<puke.length)
                    {
                        if(firstVal == this.GetCardCommonVal(puke[j])+1){isExist1=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+2){isExist2=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+3){isExist3=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+4){isExist4=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+5){isExist5=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+6){isExist6=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+7){isExist7=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+8){isExist8=j;j++;continue;}
                        j++;
                    }
                    if(isExist1>0 && isExist2>0 && isExist3>0 && isExist4>0 && isExist5>0 && isExist6>0 && isExist7>0 && isExist8>0)
                    {
                        let item = [];
                        item.push(puke[i]);
                        item.push(puke[isExist1]);
                        item.push(puke[isExist2]);
                        item.push(puke[isExist3]);
                        item.push(puke[isExist4]);
                        item.push(puke[isExist5]);
                        item.push(puke[isExist6]);
                        item.push(puke[isExist7]);
                        item.push(puke[isExist8]);
                        pukeCombile.push(item);
                    }
                }
                break; 
            }
            case gameConstDef.CARDS_TYPE.SHUNZI_10:
            {
                if(puke.length<10) break; 
                for(let i=0;i<puke.length-9;i++)
                {
                    let firstVal = this.GetCardCommonVal(puke[i]); 
                    if (firstVal >= 13) continue;
                    let isExist1 = 0;let isExist2 = 0;let isExist3 = 0;
                    let isExist4 = 0;let isExist5 = 0;let isExist6 = 0;
                    let isExist7 = 0;let isExist8 = 0;let isExist9 = 0;
                    let j=0;
                    while(j<puke.length)
                    {
                        if(firstVal == this.GetCardCommonVal(puke[j])+1){isExist1=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+2){isExist2=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+3){isExist3=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+4){isExist4=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+5){isExist5=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+6){isExist6=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+7){isExist7=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+8){isExist8=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+9){isExist9=j;j++;continue;}
                        j++;
                    }
                    if(isExist1>0 && isExist2>0 && isExist3>0 && isExist4>0 && isExist5>0 && isExist6>0 && isExist7>0 && isExist8>0 && isExist9>0)
                    {
                        let item = [];
                        item.push(puke[i]);
                        item.push(puke[isExist1]);
                        item.push(puke[isExist2]);
                        item.push(puke[isExist3]);
                        item.push(puke[isExist4]);
                        item.push(puke[isExist5]);
                        item.push(puke[isExist6]);
                        item.push(puke[isExist7]);
                        item.push(puke[isExist8]);
                        item.push(puke[isExist9]);
                        pukeCombile.push(item);
                    }
                }
                break; 
            }
            case gameConstDef.CARDS_TYPE.SHUNZI_11:
            {
                if(puke.length<11)break; 
                for(let i=0;i<puke.length-10;i++)
                {
                    let firstVal = this.GetCardCommonVal(puke[i]); 
                    if (firstVal >= 13) continue;
                    let isExist1 = 0;let isExist2 = 0;let isExist3 = 0;
                    let isExist4 = 0;let isExist5 = 0;let isExist6 = 0;
                    let isExist7 = 0;let isExist8 = 0;let isExist9 = 0;
                    let isExist10 = 0;
                    let j=0;
                    while(j<puke.length)
                    {
                        if(firstVal == this.GetCardCommonVal(puke[j])+1){isExist1=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+2){isExist2=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+3){isExist3=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+4){isExist4=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+5){isExist5=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+6){isExist6=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+7){isExist7=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+8){isExist8=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+9){isExist9=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+10){isExist10=j;j++;continue;}
                        j++;
                    }
                    if(isExist1>0 && isExist2>0 && isExist3>0 && isExist4>0 && isExist5>0 && isExist6>0 && isExist7>0 && isExist8>0 && isExist9>0 && isExist10>0)
                    {
                        let item = [];
                        item.push(puke[i]);
                        item.push(puke[isExist1]);
                        item.push(puke[isExist2]);
                        item.push(puke[isExist3]);
                        item.push(puke[isExist4]);
                        item.push(puke[isExist5]);
                        item.push(puke[isExist6]);
                        item.push(puke[isExist7]);
                        item.push(puke[isExist8]);
                        item.push(puke[isExist9]);
                        item.push(puke[isExist10]);
                        pukeCombile.push(item);
                    }
                }
                break; 
            }
            case gameConstDef.CARDS_TYPE.SHUNZI_12:
            {
                if(puke.length<12)break; 
                for(let i=0;i<puke.length-11;i++)
                {
                    let firstVal = this.GetCardCommonVal(puke[i]); 
                    if (firstVal >= 13) continue;
                    let isExist1 = 0;let isExist2 = 0;let isExist3 = 0;
                    let isExist4 = 0;let isExist5 = 0;let isExist6 = 0;
                    let isExist7 = 0;let isExist8 = 0;let isExist9 = 0;
                    let isExist10 = 0;let isExist11 = 0;
                    let j=0;
                    while(j<puke.length)
                    {
                        if(firstVal == this.GetCardCommonVal(puke[j])+1){isExist1=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+2){isExist2=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+3){isExist3=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+4){isExist4=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+5){isExist5=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+6){isExist6=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+7){isExist7=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+8){isExist8=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+9){isExist9=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+10){isExist10=j;j++;continue;}
                        if(firstVal == this.GetCardCommonVal(puke[j])+11){isExist11=j;j++;continue;}
                        j++;
                    }
                    if(isExist1>0 && isExist2>0 && isExist3>0 && isExist4>0 && isExist5>0 && isExist6>0 && isExist7>0 && isExist8>0 && isExist9>0 && isExist10>0 && isExist11>0)
                    {
                        let item = [];
                        item.push(puke[i]);
                        item.push(puke[isExist1]);
                        item.push(puke[isExist2]);
                        item.push(puke[isExist3]);
                        item.push(puke[isExist4]);
                        item.push(puke[isExist5]);
                        item.push(puke[isExist6]);
                        item.push(puke[isExist7]);
                        item.push(puke[isExist8]);
                        item.push(puke[isExist9]);
                        item.push(puke[isExist10]);
                        item.push(puke[isExist11]);
                        pukeCombile.push(item);
                    }
                }
                break; 
            }
            case gameConstDef.CARDS_TYPE.SHIP_S:
            {
                if(puke.length < 6)break;
                for(let i=0;i<puke.length;i++)
                {
                    if(this.GetCardVal(puke[i]) !== this.GetCardVal(puke[i+1]) || this.GetCardVal(puke[i+1]) !== this.GetCardVal(puke[i+2]) || this.GetCardVal(puke[i+2]) !== this.GetCardVal(puke[i+3]))continue;
                    for(let j=0;j<puke.length;j++)
                    {
                        if(this.GetCardVal(puke[i]) == this.GetCardVal(puke[j]))continue;
                        for(let k=0;k<puke.length;k++)
                        {
                            if(this.GetCardVal(puke[i]) == this.GetCardVal(puke[k]) || this.GetCardVal(puke[j]) == this.GetCardVal(puke[k]))continue;
                            let item = [];
                            item = puke.slice(i,i+4);
                            item.push(puke[j]);
                            item.push(puke[k]);
                            pukeCombile.push(item);
                        }
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.SHIP_S:
            {
                if(puke.length < 8)break;
                let allXX = this.GetCardsTypeXX(puke);
                if(allXX.length<2)break;

                for(let i=0;i<puke.length;i++)
                {
                    if(this.GetCardVal(puke[i]) !== this.GetCardVal(puke[i+1]) || this.GetCardVal(puke[i+1]) !== this.GetCardVal(puke[i+2]) || this.GetCardVal(puke[i+2]) !== this.GetCardVal(puke[i+3]))continue;
                    for(let j=0;j<allXX.length;j++)
                    {
                        if(this.GetCardVal(allXX[j][0]) == this.GetCardVal(puke[i]))continue;
                        for(let k=0;k<allXX.length;k++)
                        {
                            if(this.GetCardVal(allXX[k][0]) == this.GetCardVal(puke[i]) || this.GetCardVal(allXX[k][0]) == this.GetCardVal(allXX[j][0]))continue;
                            let item = [];
                            item = puke.slice(i,i+4);
                            item.push(allXX[j][0]);
                            item.push(allXX[j][1]);
                            item.push(allXX[k][0]);
                            item.push(allXX[k][1]);
                            pukeCombile.push(item);
                        }
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.BOMB:
            {
                if(puke.length < 4)break;
                for(let i=0;i<puke.length;i++)
                {
                    if(this.GetCardVal(puke[i]) == this.GetCardVal(puke[i+1]) && this.GetCardVal(puke[i+1]) == this.GetCardVal(puke[i+2]) && this.GetCardVal(puke[i+2]) == this.GetCardVal(puke[i+3]))
                    {
                        let item = [];
                        item = puke.slice(i,i+4);
                        pukeCombile.push(item);
                    }
                }
                break;
            }
            case gameConstDef.CARDS_TYPE.ROCKET:
            {
                if(puke.length < 2)break;
                if((puke[0] == 0x5F) && (puke[1] == 0x5E))
                {
                    let item = [];
                    item.push(puke[0]);
                    item.push(puke[1]);
                    pukeCombile.push(item);
                }
                break;
            }
        }
        return pukeCombile;
    }
})
