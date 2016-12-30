var GlobalManager = require("GlobalManager");
var constDef = require("ConstDef");
var HintManager = require("HintManager");
cc.Class({
    extends: cc.Component,

    // -- 静态加载
    // -- 动态加载（预加载、即时加载）
    // 动态即时加载只有在很少的情况下使用；游戏中大部分使用动态预加载；

    properties: {
        progressBar:cc.ProgressBar,
        labelProgress:cc.Label,
        backgroundPic:cc.Sprite,
        logo:cc.Sprite,
        progressBG:cc.Sprite,

        _load_scene:null,     // 当前正在加载的场景
        _load_urls:null,      // 传入的待加载资源的url列表（不包含场景） 
                              // arrUrls.push({type:"Spine",url:"card/back"});
        _progress:0,          // 当前加载准确进度，用于控制进度条走动（控制条进度不是实时的）
        _totalCount:0,        // 待加载资源总数（包含1个场景）
        _callback:null,       // 资源加载完毕后的回调函数
        _DirRes:Array,        // 资源加载完成后，资源数据保存在该数组中
        _resCompletedcount:0, // 已经加载完成的动态资源
        _barSpeed:0,          // 滚动条的速度
        _rolltime:0.2,          // 进度条走动到指定位置的时间     
    },
    onLoad: function () 
    {
        if (this._DirRes === null)
        {
            this._DirRes = new Array();
        }
    },

    OpenGame:function(kindID)
    {   
        // -- 加载 bg、logo、progressBG、progress、字体
        // -- 并替换这些资源
        // -- 加载 load_urls
        // -- 调用 ShowGame()

        GlobalManager.instance.selfData.nCurGameID = kindID;

        var self = this;
        var kindBaseInfo = GlobalManager.instance.confData.getKindBaseInfo(kindID);
        if(kindBaseInfo == null) return;
        var alias = kindBaseInfo.alias;
        var progressImg = self.progressBar.node.getChildByName("img").getComponent(cc.Sprite);
       
        var  loadDir = "Games/"+ alias+"/res/image/base";
        cc.loader.loadResAll(loadDir, cc.SpriteFrame, function (err, assets) {
            if (!err) 
            {
               cc.loader.loadRes(loadDir+"/background",cc.SpriteFrame,function (err, spriteFrame){self.backgroundPic.spriteFrame = spriteFrame; });
               cc.loader.loadRes(loadDir+"/logo",cc.SpriteFrame,function (err, spriteFrame){ self.logo.spriteFrame= spriteFrame; });
               cc.loader.loadRes(loadDir+"/progressBar",cc.SpriteFrame,function (err, spriteFrame){progressImg.spriteFrame = spriteFrame; });
               cc.loader.loadRes(loadDir+"/progressBG",cc.SpriteFrame,function (err, spriteFrame){self.progressBG.spriteFrame  = spriteFrame; });

               var load_urls = GlobalManager.instance.confData.getSceneLoadRes(kindID,alias+"_home");
               self.ShowGame(alias+"_home",load_urls,true,null);
            }
        });
    },

    Show:function(load_scene,callback = null)
    {
        // -- 获取 load_urls
        // -- 调用 ShowGame()
       
        var load_urls = GlobalManager.instance.confData.getSceneLoadRes(GlobalManager.instance.selfData.nCurGameID,load_scene);
        var load_urls = GlobalManager.instance.confData.getSceneLoadRes(GlobalManager.instance.selfData.nCurGameID,load_scene);
        this.ShowGame(load_scene,load_urls,false);
    },

    ShowGame:function(load_scene,load_urls = null,isReversal=false,callback = null,)
    {
        this._load_scene = load_scene;
        this._load_urls = load_urls;
        this._callback = callback;
        this._progress = 0;
        this._resCompletedcount = 0;
        this._totalCount = 1;
        
        let curScene = cc.director.getScene();
        let curNode = cc.find("Canvas",curScene);
        
        this.node.parent = curNode;
        if(isReversal)
        {
            this.node.rotation = 90;
        }
        else
        {
            this.node.rotation = 0;
        }
        
        this.node.x=0;
        this.node.y=0; 
        var widget = this.node.addComponent(cc.Widget);
        widget.top = 0;
        widget.left  = 0;
        widget.right  = 0;
        widget.bottom  = 0;

        this.progressBar.progress = 0;   
             
        if(this._load_urls)
        {
            this._totalCount += this._load_urls.length;
        }
       
        cc.director.preloadScene(load_scene,this._lodesceneCallback.bind(this));
    },
    _lodesceneCallback:function(error)
    {
        if(error === false)
        {
            cc.log("加载场景出错！")
            return;
        }
        this._progress = 1 / this._totalCount;
        this._speed = (this._progress - this.progressBar.progress) / this._rolltime;

        if(this._load_urls !== null)
        {
            if(this._resCompletedcount+1<this._totalCount)
            {
                this._lodeRes();
            }
        }
    },
    
    _lodeRes:function()
    {
        var url = this._load_urls[this._resCompletedcount].url;
        var resType = this._load_urls[this._resCompletedcount].type;
        var loadCallBack = this._completeCallback.bind(this);
        switch (this._curType) {
            case 'SpriteFrame':
                // specify the type to load sub asset from texture's url
                cc.loader.loadRes(url, cc.SpriteFrame, loadCallBack);
                break;
            case 'Spine':
                // specify the type to avoid the duplicated name from spine atlas
                cc.loader.loadRes(url, sp.SkeletonData, loadCallBack);
                break;
            case 'Font':
                cc.loader.loadRes(url, cc.Font, loadCallBack);
                break;
            case 'Animation':
            case 'Prefab':
            case 'Scene':
            case 'Texture':
            case 'Txt':
            case 'Audio':
                cc.loader.loadRes(url, loadCallBack);
                break;
            default:
                cc.loader.load(url, loadCallBack);
                break;
        }

        this._resCompletedcount++;
    },

    _completeCallback: function (error, res) 
    {
        this._progress = (this._resCompletedcount+1) / this._totalCount;
        this._speed = (this._progress - this.progressBar.progress) / this._rolltime;
        this._DirRes[this._load_urls[this._resCompletedcount-1].url] = res;        
        if(this._resCompletedcount+1<this._totalCount)    
        {
           this. _lodeRes();
        }
    },
    update: function (dt) 
    {
        if (this._totalCount === 0) return; 
       
        var del = this._speed*dt;
        var progress = this.progressBar.progress;
        if (progress >= 1) 
        {
            this.labelProgress.string = "100%";
            
            this.node.parent = null;
            GlobalManager.instance.hint.parent = null;

            if(this._callback !== null)
            {
                this._callback();
            } 
            this._callback = null;

            cc.director.loadScene(this._load_scene);

            return;
        }

        if (progress < this._progress) 
        {
            if(progress + del > this._progress)
                progress = this._progress;
            else 
                progress += del;
        }
        this.progressBar.progress = progress;
        this.labelProgress.string = Math.round((progress*100))+"%";
    },

    GetRes:function(url)
    {
        if (typeof(this._DirRes[url]) === "undefined")  return null; 
        if (this._DirRes[url] === null)  return null;

        return this._DirRes[url];
    },

    RemoveRes:function(url)
    {
        if (typeof(this._DirRes[url]) === "undefined")  return null;
        if(this._DirRes[url] === null) return;
        
        cc.loader.releaseRes(url);

        this._DirRes[url] = null;
    },

    RemoveAllRes:function()
    {
        cc.loader.releaseAll();
        this._DirRes = new Array();
    },

});
