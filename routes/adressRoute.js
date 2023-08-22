const express=require('express');
const address_route=express();
const bodyParser=require('body-parser')
address_route.use(bodyParser.json())
address_route.use(bodyParser.urlencoded({extended:true}));
const auth=require('../middlewere/auth');
const address_controller=require('../controllers/adressController')

address_route.post('/add-address',address_controller.add_address)

module.exports=address_route;