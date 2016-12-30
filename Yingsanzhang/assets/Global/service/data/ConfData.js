var ConfData = cc.Class({
    extends: cc.Component,

    properties: {
        // ---------------------------------
        bHoldPlayersInfo : false,

        arrConfPash:[],  // {path / content}
    },
    statics: {
        JsonIndex: null
    },

    loadCallBack:function(index,callback){

        var self = this;
        if (index >= self.arrConfPash.length)
        {
            callback();
            return;
        }
        cc.loader.loadRes(self.arrConfPash[index].path, function (error, resObj){
            self.arrConfPash[index].content = resObj;
            self.loadCallBack(index+1,callback); 
        });
    },

    onLoad: function () {
        ConfData.JsonIndex = cc.Enum({
            OTHER        :0,    
            T_GAME_KIND  :1,
            T_GAME_NODE  :2,
            T_GAME_ROOM  :3,
            T_GAME_TYPE  :4,
            T_ROOM_AREA  :5,
            T_SERVER_INFO  :6,
            T_GOODS      :7,
        });
    },
    callback: function(){
        
    },
    loadConfJson:function(callback){
        this.arrConfPash.push({"path":"common/jsonConf/Platform/other","content":null});
        this.arrConfPash.push({"path":"common/jsonConf/Platform/t_game_kind","content":null});
        this.arrConfPash.push({"path":"common/jsonConf/Platform/t_game_node","content":null});
        this.arrConfPash.push({"path":"common/jsonConf/Platform/t_game_room","content":null});
        this.arrConfPash.push({"path":"common/jsonConf/Platform/t_game_type","content":null});
        this.arrConfPash.push({"path":"common/jsonConf/Platform/t_room_area","content":null});
        this.arrConfPash.push({"path":"common/jsonConf/Platform/t_server_info","content":null});
        this.arrConfPash.push({"path":"common/jsonConf/Platform/t_goods","content":null});
        this.loadCallBack(0,this.callback);
    },
    
    getConfJson:function(index)
    {
        return this.arrConfPash[index];
    },

    getKindBaseInfo:function(kindId)    
    {
        let content = this.arrConfPash[ConfData.JsonIndex.T_GAME_KIND].content
        let kindBaseinfo = content.kindBaseinfo;
        for(var key in kindBaseinfo)
        {
            if(kindBaseinfo[key].Fkind_id == kindId)
            {
                return kindBaseinfo[key];
            }
        }
        return null;
    },

    getKindBaseInfos:function(typeId)    // typeId:0  表示拉取全部
    {
        let kindBaseinfos = this.arrConfPash[ConfData.JsonIndex.T_GAME_KIND].content.kindBaseinfo;
        if(typeId == 0)
        {
            return kindBaseinfos;
        }else
        {
            let tempKindBaseInfos = [];
            for(var key in kindBaseinfos)
            {
                if(kindBaseinfos[key].Ftype_id == typeId)
                {
                    tempKindBaseInfos.push(kindBaseinfos[key]);
                }
            }
            return tempKindBaseInfos;
        }
    },

    getSceneLoadRes:function(kindId,sceneName)
    {
        let baseInfo = this.getKindBaseInfo(kindId);
        let url = this.arrConfPash[ConfData.JsonIndex.T_GAME_KIND].content[baseInfo.alias][sceneName];
        return  url;
    },
    getRoomArea:function(kindId,kindSeq)
    {
        let areaBaseinfos = this.arrConfPash[ConfData.JsonIndex.T_ROOM_AREA].content.areaBaseinfo;

        for(var key in areaBaseinfos)
        {
            if(areaBaseinfos[key].Fkind_id == kindId && areaBaseinfos[key].Fkind_seq == kindSeq)
            {
                return areaBaseinfos[key];
            }
        }

    },
    getGameNode:function(areaId,areaSeq=null)
    {
          
          let nodeBaseinfos = this.arrConfPash[ConfData.JsonIndex.T_GAME_NODE].content.nodeBaseinfo;
          if(areaSeq == null)
          {
              var tempNodes = [];
              for(var key in nodeBaseinfos)
              {
                  if(nodeBaseinfos[key].Farea_id == areaId)
                  {
                       tempNodes.push(nodeBaseinfos[key]);
                  }
                 
              }
              return tempNodes;
          }else
          {
               for(var key in nodeBaseinfos)
               {
                    if(nodeBaseinfos[key].Farea_id == areaId && nodeBaseinfos[key].Farea_seq == areaSeq)
                    {
                        return nodeBaseinfos[key];
                    }
               }
          }
    },
    getGameRoom:function(nodeId,nodeSeq=null)
    {
        let roomBaseinfo = this.arrConfPash[ConfData.JsonIndex.T_GAME_ROOM].content.roomBaseinfo;
       
        for(var key in roomBaseinfo)
        {
            if(roomBaseinfo[key].Fnode_id == nodeId )
            {
                return roomBaseinfo[key];
            }
        }
    },
    getServerInfo:function(serverId)
    {
        let serverBaseinfos = this.arrConfPash[ConfData.JsonIndex.T_SERVER_INFO].content.serverBaseinfo;
        if(serverId == 0)
        {
            return serverBaseinfos;
        }else
        {
            let tempServerBaseInfos = [];
            for(var key in serverBaseinfos)
            {
                if(serverBaseinfos[key].Fserver_id == serverId)
                {
                    tempServerBaseInfos.push(serverBaseinfos[key]);
                    break;
                }
            }
            return tempServerBaseInfos[0];
        }
    },
    getGoodsName:function(kindId,subGoodsId)    // goodsId = kindId+subGoodsId
    {
        var newKindId = kindId.toString();
        var s1 = "0000"+newKindId;
        newKindId = s1.substr(newKindId.length,4);

        var newSubGoodsId = parseInt(subGoodsId).toString(16); 
        var s2 = "0000" + newSubGoodsId;
        newSubGoodsId = s2.substr(newSubGoodsId.length,4);

        var goodsId = "0x"+ newKindId + newSubGoodsId;
        let goods = this.arrConfPash[ConfData.JsonIndex.T_GOODS].content;
        return goods[goodsId];
    }
});
