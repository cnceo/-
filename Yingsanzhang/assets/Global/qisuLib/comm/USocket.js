var ProtocolMessage = require("ProtocolMessage");
var ServerInfo = require("ServerInfo");
var ProtocolItem = require("ProtocolItem");
	
var servers = {};

var openHandler=null;
var closeHandler=null;
var sendFailedHandler=null;
var messageHandler=null;

var bLogFlag = false;

function onOpen(evt)
{
    var url = this.urlVal;
    if ((evt.currentTarget!==undefined) && (evt.currentTarget!==null)) 
    {
        url = evt.currentTarget.url;
    }
    
    if (servers[url]===undefined)
	{
	    return;
	}
	if (servers[url]._web_sock===null)
	{
	    return;
	}
	
    console.log('websocket opened: ' + servers[url]._url);
    
    servers[url].StartTimer();
    
    if (openHandler !== null)
	{
	    openHandler(url);
	}
}
function onClose(evt)
{
    var url = this.urlVal;
    if ((evt.currentTarget!==undefined) && (evt.currentTarget!==null)) 
    {
        url = evt.currentTarget.url;
    }
    console.log('websocket close: ' +url );
    USocket.CloseSocket(url, USocket.SOCK_CLOSE_PEER);
} 
function onMessage(evt)
{
    var url = this.urlVal;
    if ((evt.currentTarget!==undefined) && (evt.currentTarget!==null)) 
    {
        url = evt.currentTarget.url;
    }
    
    var serverinfo = servers[url];
    
    if (serverinfo===undefined)
	{
	    return;
	}
	if (serverinfo._web_sock===null)
	{
	    return;
	}
    
    if(typeof(evt.data)=="string")
    {  
        textHandler(url, JSON.parse(evt.data));  
    }
    else
    {  
        var data = new DataView(evt.data);  
        if (binaryHandler(url, data,serverinfo)<0)
        {
            USocket.CloseSocket(url, USocket.SOCK_CLOSE_DECODE_ERR);
        }
        
        // let reader = new FileReader();   
        // reader.onload = function(evt)
        // {  
        //     if(evt.target.readyState == FileReader.DONE)
        //     {  
        //         var data = new DataView(evt.target.result);  
        //         if (binaryHandler(url, data,serverinfo)<0)
        //         {
        //             USocket.CloseSocket(url, USocket.SOCK_CLOSE_DECODE_ERR);
        //         }  
        //     }  
        // };  
        // reader.readAsArrayBuffer(evt.data);  


        
        
    }  
}

function onError(evt)
{
    var url = this.urlVal;
    if ((evt.currentTarget!==undefined) && (evt.currentTarget!==null)) 
    {
        url = evt.currentTarget.url;
    }
    
    if (servers[url]===undefined)
	{
	    return;
	}
	if (servers[url]._web_sock===null)
	{
	    return;
	}
	
    if (sendFailedHandler !== null)
	{
	    sendFailedHandler(url);
	}
}

function IsLittleEndian()
{
    var buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
    
    // return new Int16Array(buffer)[0] === 256;
    if (new Uint8Array(buffer)[0]===0) return false;
    else return true;
}

var USocket = 
{
    isLittleEndian:false, 
    
    init:function(_openHandler, _messageHandler, _closeHandler, _sendFailedHandler, _bLogFlag)
    {
        this.isLittleEndian = IsLittleEndian();
        
        messageHandler = _messageHandler;
        openHandler = _openHandler;
        closeHandler = _closeHandler;
        sendFailedHandler = _sendFailedHandler;
        
        bLogFlag = _bLogFlag;
    },
    
    IsConnected:function(url)
    {
        if (url.charAt(url.length-1) != '/')
        {
            url += "/";
        }
        if (servers[url]===undefined) return false;
        if (servers[url]._web_sock===null) return false;
        return true;
    },
    
    AddServer:function(url)  // "ws://203.195.129.201:5338/"
    {
        if (url.charAt(url.length-1) != '/')
        {
            url += "/";
        }
        
        if (servers[url]===undefined)
        {
            servers[url] = new ServerInfo(url);
            servers[url]._web_sock = new WebSocket(url);
            servers[url]._web_sock.binaryType = "arraybuffer" ;
            servers[url]._web_sock.urlVal = url;
            servers[url]._web_sock.onopen = onOpen;
            servers[url]._web_sock.onclose = onClose;
            servers[url]._web_sock.onmessage = onMessage;
            servers[url]._web_sock.onerror = onError;
        }
        else
        {
            if (servers[url]._web_sock===null)
            {
                servers[url].check = 0;
                servers[url]._web_sock = new WebSocket(url);
                servers[url]._web_sock.binaryType = "arraybuffer" ; 
                servers[url]._web_sock.urlVal = url;
            }
            else
            {
            }
        }
    },
    
    CloseSocket:function (url, errCode=0)
	{
        if (url.charAt(url.length-1) != '/')
        {
            url += "/";
        }
        
		if (servers[url]===undefined)
		{
		    return;
		}
		if (servers[url]._web_sock===null)
		{
		    return;
		}
        
        servers[url].StopTimer();
		servers[url]._web_sock.close(); 	
		
		delete servers[url];
        
        if (closeHandler !== null)
        {
            closeHandler(url,errCode);
        }
	},
	
	SendMessage:function(url, msg)
	{
        if (url.charAt(url.length-1) != '/')
        {
            url += "/";
        }
        
	    if (servers[url]===undefined) return -1;
		if (servers[url]._web_sock===null) return -1;
		if (servers[url]._web_sock.readyState != WebSocket.OPEN) return -1;
	    
	    var ret = ProtocolMessage.EncodeMsg(msg,servers[url]);
	    if (ret !== 0) return -2;
	    servers[url]._web_sock.send(msg._byte_array.buffer);
        
        return 0;
	},
};

USocket.SOCK_CLOSE_SELF = 0;
USocket.SOCK_CLOSE_PEER = 1;
USocket.SOCK_CLOSE_DECODE_ERR = 2;

function textHandler(url, objData)
{
}

function recursion_decode_vector(_msg)
{
    var len = ProtocolMessage.decodeShort(_msg);
    var vect = new Array(len);
    
    for(var i = 0; i<len; i++)
    {
        var item = new ProtocolItem();
        item._datatype = ProtocolMessage.decodeByte(_msg);
        
        switch (item._datatype)
        {
            case ProtocolItem.DATATYPE_BYTE:
                item._int_value = ProtocolMessage.decodeByte(_msg);
                break;
            case ProtocolItem.DATATYPE_SHORT:
                item._int_value = ProtocolMessage.decodeShort(_msg);
                break;
            case ProtocolItem.DATATYPE_INT:
                item._int_value = ProtocolMessage.decodeInt(_msg);
                break;
            case ProtocolItem.DATATYPE_STRING:
            
                var strlen = ProtocolMessage.decodeShort(_msg);
                if (strlen>0)
                {
                    var pszVal = new Uint8Array(strlen);
                    for (var t=0; t<strlen; t++)
                        pszVal[t] = ProtocolMessage.decodeByte(_msg);
                    item._str_value = ProtocolMessage.Utf8ArrayToStr(pszVal);	
                }
                else
                {
                    item._str_value="";
                }
                break;
            case ProtocolItem.DATATYPE_VECTOR:
                item._vect_value = recursion_decode_vector(_msg);
                break;
            default:
                return null;	
        }
        
        vect[i] = item;
    }
        
    return vect;
}
    
function binaryHandler(url, data,serverinfo)
{
    // 此处要传入serverinfo，因为chrome下获取不到servers（FileReader异步转换Blob到ArrayBuffer）
    // var serverinfo = servers[url];
    
    if (serverinfo._msg===null)
        serverinfo._msg = new ProtocolMessage(0,0,USocket.isLittleEndian); 
    if (serverinfo._msg.data_buffer.byteLength < serverinfo._msg.data_length + data.byteLength)
    {
        var dataTmp = new Uint8Array(serverinfo._msg.data_length);
        for (var i=0; i<serverinfo._msg.data_length; i++)
            dataTmp[i] = serverinfo._msg.data_view.getUint8(i);
        serverinfo._msg.data_buffer = new ArrayBuffer(serverinfo._msg.data_length + data.byteLength);
        serverinfo._msg.data_view = new DataView(serverinfo._msg.data_buffer);
        for (var i=0; i<serverinfo._msg.data_length; i++) 
            serverinfo._msg.data_view.setUint8(i, dataTmp[i]);     
    }  
    for (var a1=0; a1<data.byteLength; a1++) 
        serverinfo._msg.data_view.setUint8(serverinfo._msg.data_length+a1, data.getUint8(a1));
    serverinfo._msg.data_length += data.byteLength;
        
    while (true)
	{
        if (serverinfo._msg.data_length===0) break;
	    
        if (serverinfo._flag_receive_step===0)
        {
            serverinfo._msg.data_offset = 0;
            serverinfo.curMsg = new ProtocolMessage(0,0,USocket.isLittleEndian); 
        }
		
		if (serverinfo._flag_receive_step<=1)
		{
            if (serverinfo._msg.data_length<2)
            {
                serverinfo._flag_receive_step=1;
                return 0;
            }
					
            serverinfo.curMsg._head_version = ProtocolMessage.decodeByte(serverinfo._msg);
            serverinfo.curMsg._head_checkCode = ProtocolMessage.decodeByte(serverinfo._msg);
            serverinfo._flag_receive_step=0;
					
            if (serverinfo.curMsg._head_version != ProtocolItem.SOCKET_VER)
            {
                console.log ("解码失败（开始标志错误），客户端关闭连接！");
                return -1;
            }	
        }
				
        if (serverinfo._flag_receive_step<=2)
        {
            if (ProtocolMessage.GetAvailable(serverinfo._msg)<2)
            {
                serverinfo._flag_receive_step=2;
                return 0;
            }
            
            serverinfo.curMsg._head_msgLen = ProtocolMessage.decodeShort(serverinfo._msg);
            serverinfo._flag_receive_step=0; 
            
            serverinfo._msg._remainLen = serverinfo.curMsg._head_msgLen - 4;
        }
				
        if (serverinfo._flag_receive_step<=3)
        {
            if (ProtocolMessage.GetAvailable(serverinfo._msg) < serverinfo._msg._remainLen)
            {
                serverinfo._msg._remainLen -= ProtocolMessage.GetAvailable(serverinfo._msg);
                serverinfo._flag_receive_step=3;
                return 0;
            }
            serverinfo._flag_receive_step=0;
        }
	
        serverinfo.curMsg._head_mainCmdID  = ProtocolMessage.decodeShort(serverinfo._msg);
        serverinfo.curMsg._head_subCmdID   = ProtocolMessage.decodeShort(serverinfo._msg);
			
        for (var i=0; i<13; i++)
        {
            ProtocolMessage.decodeByte(serverinfo._msg);
        }
		serverinfo.curMsg._receive_seq = ProtocolMessage.decodeInt(serverinfo._msg);
        for (var i=0; i<4; i++)
        {
            ProtocolMessage.decodeByte(serverinfo._msg);
        }
			
        var checkCode = 0;
        for (var k=29; k<serverinfo.curMsg._head_msgLen; k++)
        {
            var val = ProtocolItem.RecvByteMap[serverinfo._msg.data_view.getUint8(k)];
            serverinfo._msg.data_view.setUint8(k, val);
            
            checkCode += val;
        }
        checkCode &= 0x000000FF;
        if (checkCode != serverinfo.curMsg._head_checkCode)
        {
            console.log ("解码失败，校验码错误！");
            return -1;
        }
		
	    while (serverinfo._msg.data_offset < (serverinfo.curMsg._head_msgLen-1))
        {
            var item = new ProtocolItem();
            item._datatype = ProtocolMessage.decodeByte(serverinfo._msg);
				
            switch (item._datatype)
            {
                case ProtocolItem.DATATYPE_BYTE:
                    item._int_value = ProtocolMessage.decodeByte(serverinfo._msg);
                    break;
                case ProtocolItem.DATATYPE_SHORT:
                    item._int_value = ProtocolMessage.decodeShort(serverinfo._msg);
                    break;
                case ProtocolItem.DATATYPE_INT:
                    item._int_value = ProtocolMessage.decodeInt(serverinfo._msg);
                    break;
                case ProtocolItem.DATATYPE_STRING:
                    var len = ProtocolMessage.decodeShort(serverinfo._msg);
                    if (len>0)
                    {
                        var pszVal = new Uint8Array(len);
                        for (var i=0; i<len; i++)
                            pszVal[i] = ProtocolMessage.decodeByte(serverinfo._msg);
                        item._str_value = ProtocolMessage.Utf8ArrayToStr(pszVal);	
                    }
                    else
                    {
                        item._str_value="";
                    }
                    break;
                case ProtocolItem.DATATYPE_VECTOR:
                    item._vect_value = recursion_decode_vector(serverinfo._msg);
                    break;
                default:
                    console.log ("解码失败（异常），客户端关闭连接！");
                    return -1;	
            }
				
            serverinfo.curMsg._body_msg.push(item);
        }
			
        var strCmd = "["+serverinfo.curMsg._head_mainCmdID.toString(16)+":"+serverinfo.curMsg._head_subCmdID.toString(16)+"]";
        if (bLogFlag) console.log ("=========================> RECEIVE MESSAGE, TYPE"+strCmd+", SEQ["+serverinfo.curMsg._receive_seq+"]");
		serverinfo._msg.data_length -= serverinfo.curMsg._head_msgLen;
        serverinfo._msg.data_offset=0;
        for (var i=0; i<serverinfo._msg.data_length; i++)
        {
            serverinfo._msg.data_buffer[i] = serverinfo._msg.data_buffer[serverinfo.curMsg._head_msgLen+i];
        }
        var adjustLen = (serverinfo._msg.data_length<ProtocolItem.BUFFER_RECV)?ProtocolItem.BUFFER_RECV:serverinfo._msg.data_length;
        if (serverinfo._msg.data_buffer.byteLength != adjustLen)
        {
            var dataTmp = new Uint8Array(serverinfo._msg.data_length);
            for (var i=0; i<serverinfo._msg.data_length; i++)
                dataTmp[i] = serverinfo._msg.data_view.getUint8(i);
            serverinfo._msg.data_buffer = new ArrayBuffer(adjustLen);
            serverinfo._msg.data_view = new DataView(serverinfo._msg.data_buffer);
            for (var i=0; i<serverinfo._msg.data_length; i++) 
                serverinfo._msg.data_view.setUint8(i, dataTmp[i]);
        }
        
        if (serverinfo.curMsg._receive_seq==0)
        {
            messageHandler(serverinfo.curMsg._head_mainCmdID,serverinfo.curMsg._head_subCmdID,serverinfo.curMsg._body_msg);
            continue;
        }
				
        if (serverinfo.curMsg._receive_seq < (serverinfo.nCurReceiveSeq+1))
        {
            console.log ("====[FATAL ERROR]====> RECEIVE MESSAGE, TYPE"+strCmd+", SEQ["+serverinfo.curMsg._receive_seq+"]");
            return -1;
        }
        else
        {
            var x=0;
            for (x=0; x<serverinfo.vectMsgQueue.length; x++)
            {
                if (serverinfo.vectMsgQueue[x]._receive_seq == serverinfo.curMsg._receive_seq)
                {
                    // 重复接收的消息是否考虑继续 continue;
                    console.log ("====[FATAL ERROR]====> RECEIVE MESSAGE, TYPE"+strCmd+", SEQ["+serverinfo.curMsg._receive_seq+"]");
                    return -1;
                }
                if (serverinfo.vectMsgQueue[x]._receive_seq > serverinfo.curMsg._receive_seq) break;
            }
            if (x==serverinfo.vectMsgQueue.length) 
            {
                serverinfo.vectMsgQueue.push(serverinfo.curMsg);
            }
            else
            {
                serverinfo.vectMsgQueue.splice(x,0,serverinfo.curMsg);	
            }
            
            for (x=0; x<serverinfo.vectMsgQueue.length; x++)
            {
                var msgItem = serverinfo.vectMsgQueue[x];
                if (msgItem._receive_seq == (serverinfo.nCurReceiveSeq+1))
                {
                    serverinfo.nCurReceiveSeq = serverinfo.nCurReceiveSeq+1;
                    messageHandler(msgItem._head_mainCmdID,msgItem._head_subCmdID,msgItem._body_msg);
                }
                else break;
            }
            serverinfo.vectMsgQueue.splice(0,x);
            
            if (serverinfo.vectMsgQueue.length == 0) serverinfo.waitTimes=0;
            else
            {
                console.log ("====[ERROR]====> RECEIVE MESSAGE, TYPE"+strCmd+", SEQ["+serverinfo.curMsg._receive_seq+"], vect length["+serverinfo.vectMsgQueue.length+"]");
                if (serverinfo.waitTimes>5)
                {
                    console.log ("====[FATAL ERROR, timeout]====> RECEIVE MESSAGE, TYPE"+strCmd+", SEQ["+serverinfo.curMsg._receive_seq+"], vect length["+serverinfo.vectMsgQueue.length+"]");
                    return -1;
                }
            }
            if (serverinfo.vectMsgQueue.length > 100) 
            {
                console.log ("====[FATAL ERROR]====> RECEIVE MESSAGE, TYPE"+strCmd+", SEQ["+serverinfo.curMsg._receive_seq+"], vect length["+serverinfo.vectMsgQueue.length+"]");
                return -1;
            }
        }
    }
    
    return 0;
} 

module.exports = USocket;



