var express = require('express');
var path = require('path');
var app = express();
var bodyparser = require('body-parser');
var data = [
    {name : "John" , age : 15 ,gender: "boy", grade : 8 },
    {name : "Marry" , age : 14,gender:"girl", grade : 7 },
    {name : "Tony" , age : 13,gender:"boy", grade : 7 },
    {name : "Amy" , age : 13,gender:"girl", grade : 8 },
];
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended : false}));

app.post('/postS', function(req ,res){
    var name  = req.body.name,
        age = req.body.age,
        gender = req.body.gender,
        grade = req.body.grade;
    var info = {
        name : name,
        age : age ,
        gender :gender ,
        grade : grade
    };
    if(name && age && gender && grade){
        data.unshift(info);
        res.status(200).json({success:true ,msg : '添加成功！' });
    }else {
        res.status(200).json({success:false ,msg : '添加失败！' });
    }

});

app.get('/getM',function(req ,res){
    // res.send('请求的内容');
    // res.sendFile(path.join(__dirname ,'static','data','menu.json'));
    // res.status(200).json(data);
    res.status(200).json({success : true ,obj : data});
});
app.post('/postM',function(req ,res){
    res.status(200).send('这是post的内容数据');
});
app.all('/getPM',function (req,res) {
    res.status(200).send('这是get/post的内容数据');
});
app.get('/route/:id',function (req ,res) {
    var id = req.params.id;
    if(data[id]){
        res.status(200).json({success:true , obj : data[id]});
    }else {
        res.status(200).json({success :false , obj : "数据不存在!" });
    }
});


app.use(express.static(path.join(__dirname , 'static')));
app.use('/list',function(req , res){
    res.status(200).sendFile(path.join(__dirname ,'static','list.html'))
});
app.use('*',function(req ,res){
    res.status(200).sendFile(path.join(__dirname,'static','err','404.html'))
});




app.listen(3000 ,function (err) {
    if(err){
        throw err;
    }
    console.log('服务器启动成功！端口3000');
});