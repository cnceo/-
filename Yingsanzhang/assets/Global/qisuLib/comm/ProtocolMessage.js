var ProtocolItem = require("ProtocolItem");

var ProtocolMessage = function (nMainCmd,nSubCmd,endian)
{
    this._endian = endian;
    
    // msg head
    this._head_version=0;           // 1字节
	this._head_checkCode=0;         // 1字节
	this._head_msgLen=0;            // 2字节，整个消息长度
	this._head_mainCmdID=nMainCmd;  // 2字节
	this._head_subCmdID=nSubCmd;	// 2字节

    // msg body
	this._body_msg=new Array(0);
	
	// 码流
	this.data_buffer = new ArrayBuffer(ProtocolItem.BUFFER_INIT);
	this.data_view = new DataView(this.data_buffer);
	this.data_length = 0;
	this.data_offset = 0;
	this._byte_array=null; // Uint8Array

    // 辅助
	this._receive_seq=0;
    this._remainLen=0;
};

ProtocolMessage.GetAvailable = function (msg)
{
    return (msg.data_length - msg.data_offset);
};
ProtocolMessage.GetRandomNum = function (Min,Max)
{ 
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
};

ProtocolMessage.GetVersionCodeA = function (serverInfo)
{
    if (serverInfo.check===0)
        return ProtocolItem.SOCKET_VER;
    
    return ((serverInfo.check * ProtocolItem.SOCKET_VER) & 0x000000FF);
};

ProtocolMessage.GetCheckCodeA = function (serverInfo,code)
{
    if (serverInfo.check===0)
    {
        serverInfo.check = ProtocolMessage.GetRandomNum(0,10000);
    }
    else
    {
        code &= 0x000000FF;
        if (code===0) code = 2;
        serverInfo.check *= code;
        serverInfo.check += ProtocolItem.SOCKET_KEY;
    }
    
    serverInfo.check &= 0x000000FF;
    if (serverInfo.check===0) serverInfo.check=1;
    
    return serverInfo.check;
};
    
ProtocolMessage.EncodeMsg=function(msg,serverInfo)
{
    // --
    msg.data_length = 0;
    msg.data_offset = 0;
    
    // --
    ProtocolMessage.encodeByte(msg, ProtocolMessage.GetVersionCodeA(serverInfo));
    ProtocolMessage.encodeByte(msg, 0);
    ProtocolMessage.encodeShort(msg, 0); 
    ProtocolMessage.encodeShort(msg, msg._head_mainCmdID); 
    ProtocolMessage.encodeShort(msg, msg._head_subCmdID); 
    for (var j=0; j<21; j++)
	{
	    ProtocolMessage.encodeByte(msg, 0);
	}
	
    if (ProtocolMessage.recursion_encode_vector(msg, msg._body_msg,true)<0) 
        return -1;
       
    // --
    msg.data_offset=2;
    ProtocolMessage.encodeShort(msg, msg.data_length); 
    
    // --
    var checkCode=0;
    for(var k=0; k<(msg.data_length-29); k++)
    {
        var val = msg.data_view.getUint8(29+k);
        msg.data_view.setUint8(29+k, ProtocolItem.SendByteMap[val]);
        
        checkCode += val;
    }
    checkCode = ProtocolMessage.GetCheckCodeA(serverInfo,checkCode);
    msg.data_offset=1;
    ProtocolMessage.encodeByte(msg, checkCode); 
            
    // --        
    msg._byte_array = new Uint8Array(msg.data_length);
    for (var n=0; n<msg.data_length; n++)
    {
        msg._byte_array[n] = msg.data_view.getUint8(n);
    }
    
    return 0;
};

ProtocolMessage.recursion_encode_vector = function (msg, value, beginFlag=false) 
{
    if (value === null)
    {
        return 0;
    }
    
    if (beginFlag===false)
        ProtocolMessage.encodeShort(msg, value.length); 
    
    for (var i=0; i<value.length; i++)
	{
		ProtocolMessage.encodeByte(msg, value[i]._datatype);
		switch (value[i]._datatype)
		{
			case ProtocolItem.DATATYPE_BYTE:
			    ProtocolMessage.encodeByte(msg, value[i]._int_value);
				break;
			case ProtocolItem.DATATYPE_SHORT:
			    ProtocolMessage.encodeShort(msg, value[i]._int_value); 
				break;
			case ProtocolItem.DATATYPE_INT:
				ProtocolMessage.encodeInt(msg, value[i]._int_value); 
				break;
			case ProtocolItem.DATATYPE_STRING:
				ProtocolMessage.encodeString(msg, value[i]._str_value);
				break;
			case ProtocolItem.DATATYPE_VECTOR:
				if (ProtocolMessage.recursion_encode_vector(msg, value[i]._vect_value)== -1)
				{
					return -1;
				}
				break;
			default:
				return -1;	
		}
	}
    
    return 0;
};
        
ProtocolMessage.Utf8ArrayToStr = function (arrayVal) 
{
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = arrayVal.length;
    i = 0;
    while(i < len) 
    {
        c = arrayVal[i++];
        switch(c >> 4)
        { 
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
        case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = arrayVal[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
        case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = arrayVal[i++];
            char3 = arrayVal[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
            break;
        }
    }

    return out;
};

ProtocolMessage.toUTF8Array = function (str) 
{
    var utf8 = [];
    for (var i=0; i < str.length; i++) 
    {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) 
        {
            utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) 
        {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else 
        {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
};

ProtocolMessage.decodeByte=function (msg)
{
    var val = msg.data_view.getUint8(msg.data_offset);
    msg.data_offset++;
    return val;
};
ProtocolMessage.decodeShort=function (msg)
{
    var val = msg.data_view.getUint16(msg.data_offset, msg._endian);
    msg.data_offset+=2;
    return val;
};
ProtocolMessage.decodeInt=function (msg)
{
    var val = msg.data_view.getUint32(msg.data_offset, msg._endian);
    msg.data_offset+=4;
    return val;
};

ProtocolMessage.encodeByte=function (msg, value)
{
    var newLength = msg.data_length;
    if ((msg.data_offset+1) > msg.data_length) 
        newLength = msg.data_offset+1;
    while (newLength > msg.data_buffer.byteLength) 
    {
        var dataTmp = new Uint8Array(msg.data_buffer.byteLength);
        for (var i=0; i<msg.data_buffer.byteLength; i++)
            dataTmp[i] = msg.data_view.getUint8(i);
        msg.data_buffer = new ArrayBuffer(msg.data_buffer.byteLength + ProtocolItem.BUFFER_STEP);
        msg.data_view = new DataView(msg.data_buffer);
        for (var i=0; i<msg.data_buffer.byteLength; i++) 
        {
            if (i >= dataTmp.byteLength) msg.data_view.setUint8(i, 0);
            else msg.data_view.setUint8(i, dataTmp[i]);
        }
    } 
    
    msg.data_view.setUint8(msg.data_offset, value); 
    msg.data_offset++;
    msg.data_length = newLength;
};
ProtocolMessage.encodeBytes=function (msg, value)
{
    for (var i=0; i<value.length; i++)
    {
        ProtocolMessage.encodeByte(msg, value[i]);
    }
};
ProtocolMessage.encodeShort=function (msg, value)
{
    var newLength = msg.data_length;
    if ((msg.data_offset+2) > msg.data_length) 
        newLength = msg.data_offset+2;
    while (newLength > msg.data_buffer.byteLength) 
    {
        var dataTmp = new Uint8Array(msg.data_buffer.byteLength);
        for (var i=0; i<msg.data_buffer.byteLength; i++)
            dataTmp[i] = msg.data_view.getUint8(i);
        msg.data_buffer = new ArrayBuffer(msg.data_buffer.byteLength + ProtocolItem.BUFFER_STEP);
        msg.data_view = new DataView(msg.data_buffer);
        for (var i=0; i<msg.data_buffer.byteLength; i++) 
        {
            if (i >= dataTmp.byteLength) msg.data_view.setUint8(i, 0); 
            else msg.data_view.setUint8(i, dataTmp[i]); 
        }  
    } 
    
    msg.data_view.setUint16(msg.data_offset, value, msg._endian);  
    msg.data_offset+=2;
    msg.data_length = newLength; 
};		
ProtocolMessage.encodeInt=function (msg,value)
{
    var newLength = msg.data_length;
    if ((msg.data_offset+4) > msg.data_length) 
        newLength = msg.data_offset+4;
    while (newLength > msg.data_buffer.byteLength) 
    {
        var dataTmp = new Uint8Array(msg.data_buffer.byteLength);
        for (var i=0; i<msg.data_buffer.byteLength; i++)
            dataTmp[i] = msg.data_view.getUint8(i);
        msg.data_buffer = new ArrayBuffer(msg.data_buffer.byteLength + ProtocolItem.BUFFER_STEP);
        msg.data_view = new DataView(msg.data_buffer);
        for (var i=0; i<msg.data_buffer.byteLength; i++) 
        {
            if (i >= dataTmp.byteLength) msg.data_view.setUint8(i, 0);
            else msg.data_view.setUint8(i, dataTmp[i]);
        }
    } 
    
    msg.data_view.setUint32(msg.data_offset, value, msg._endian); 
    msg.data_offset+=4;
    msg.data_length = newLength; 
};
ProtocolMessage.encodeString=function (msg,value)
{
	var arrVal = ProtocolMessage.toUTF8Array(value);
    
    ProtocolMessage.encodeShort(msg, arrVal.length);
    ProtocolMessage.encodeBytes(msg, arrVal);
};

ProtocolMessage.AddVectItemNumber=function (contain, type, value, pos=-1)
{
    var item = new ProtocolItem();

	item._datatype = type;
	item._int_value = value;
		
	if (pos < 0)
	{
		contain.push(item);	
	}
	else
	{
		contain.splice(pos,0,item);
	}
		
	return contain.length;
};
ProtocolMessage.AddVectItemByte=function (contain, value, pos=-1)
{
	return ProtocolMessage.AddVectItemNumber(contain,ProtocolItem.DATATYPE_BYTE,value,pos);
};
ProtocolMessage.AddVectItemShort = function (contain, value, pos=-1)
{
	return ProtocolMessage.AddVectItemNumber(contain,ProtocolItem.DATATYPE_SHORT,value,pos);
};
ProtocolMessage.AddVectItemInt=function (contain, value, pos=-1)
{
	return ProtocolMessage.AddVectItemNumber(contain,ProtocolItem.DATATYPE_INT,value,pos);
};
ProtocolMessage.AddVectItemString=function (contain, value, pos=-1)
{
	var item = new ProtocolItem();
	
	item._datatype = ProtocolItem.DATATYPE_STRING;
	item._str_value = value;
	
	if (pos < 0)
	{
		contain.push(item);	
	}
	else
	{
		contain.splice(pos,0,item);
	}
	
	return contain.length;
};
ProtocolMessage.AddVectItemVect=function (contain, pos=-1)
{
	var item = new ProtocolItem();
	
	item._datatype = ProtocolItem.DATATYPE_VECTOR;
	item._vect_value = new Array(0);
	
	if (pos < 0)
	{
		contain.push(item);	
	}
	else
	{
		contain.splice(pos,0,item);
	}
	
	return contain.length;
};
	
module.exports = ProtocolMessage;



