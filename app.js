const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var DateOnly = require('mongoose-dateonly')(mongoose);
const app = express();
// ===========================================================Declarations========================================================
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use('/static',express.static(__dirname+"/public"));
// ===========================================================Uses========================================================
mongoose.connect("mongodb+srv://admin_mohammed:Mohammed52@cluster0-i0eix.mongodb.net/KhwajaDB", {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// ===========================================================Declarations========================================================//
// ===========================================================Schemas========================================================//
const bikeSchema ={
	bname : String,
	model : Number,
	chasisno : { type: String, unique: true },
	registerno:{ type: String, unique: true },
	seller:String,
	bdate: Date,
	pamount:Number,
	jobcard:Number,
	tranfer:Number,
	jcref:String,
	totalcost:Number,
	ledger:String,
	note:String,
	rc: { type: Boolean, default: false },
	receive: { type: Boolean, default: false },
	rent: { type: Boolean, default: false },
	purchasemonth:Number,
	status: String
}

const Bike = mongoose.model("Bike",bikeSchema);

const buyerSchema={
	name : String,
	add : String,
	contact :Number,
	sdate : Date,
	samount: Number,
	transamount:{
		type:Number,
		default:0
		},
	paid : Number,
	due : Number,
	snote : String,
	rc: { type: Boolean, default: false },
	delivery: { type: Boolean, default: false },
	clearmonth:Number,
	salemonth:Number,
	guarantee:String,
	bike: bikeSchema
}
const Buyer=mongoose.model("Buyer",buyerSchema);
const capitalSchema={
	date:Date,
	balance:Number
	
}
const Capital = mongoose.model("Capital",capitalSchema);


const fundSchema={
	date:Date,
	description:String,
	credit:{
		type:Number,
		default:0
	},
	debit:{
		type:Number,
		default:0
	},
}
const Fund=mongoose.model("Fund",fundSchema);


const bikehisSchema={
	bname:String,
	model:Number,
	registerno:String,
	chasisno:String,
	pdate : { type : Array , "default" : [] },
	from : { type : Array , "default" : [] },
	cost : { type : Array , "default" : [] },
	sdate : { type : Array , "default" : [] },
	to : { type : Array , "default" : [] },
	price : { type : Array , "default" : [] }
}	
const Bikehistory = mongoose.model("Bikehistory",bikehisSchema);


const expincSchema={
	date:Date,
	description:String,
	credit:{
		type:Number,
		default:0
	},
	debit:{
		type:Number,
		default:0
	},
}
const Account=mongoose.model("Account",expincSchema);

const rentSchema ={
	bname : String,
	registerno:String,
	name:String,
	contact :Number,
	hdate: Date,
	rdate: Date,
	rate:Number,
	receive:Number,
	due:Number,
	note:String,
	cleardue:Number,
	status: { type: Boolean, default: false },
}
const Rent=mongoose.model("Rent",rentSchema);



const statisSchema={
	date:Date,
	month:Number,
	capital: { type: Number, default:0 },
	purchase: { type: Number, default:0 },
	sales: { type: Number, default:0 },
	income: { type: Number, default:0 },
	expenses: { type: Number, default:0 },
	profit: { type: Number, default:0 },
	loss: { type: Number, default:0 },
	rent: { type: Number, default:0 },
	status: { type: Boolean, default: false }
}
const Statistics = mongoose.model("Statistics",statisSchema);


const taskSchema={
	date: Date,
	task: String
}
const Task = mongoose.model("Task",taskSchema);

// ===========================================================Schemas========================================================//


// ===========================================================Get Request========================================================//
app.get("/", function(req, res){
	var purchase = 0;
	var balance =0;
	var sales=0;
	var credit=0;
	var debit=0;
	var inccredit=0;
	var expdebit=0;
	var capital =0;
 var today= new Date();
 var tdy=(1+ today.getMonth());
var month= today.getFullYear() + "-"+ (today.getMonth()) + "-" + 31;

			Capital.findOne({date:{$gt:month}}, function(err, capRecordes){
			if(capRecordes){capital =capRecordes.balance;
							Statistics.findOne({month:tdy},function(err,stRec){
    						if(stRec){	capital=(capital-stRec.purchase - stRec.expenses)+ stRec.sales;
    									balance=capital+stRec.income+stRec.rent;
    								Fund.find({date:{$gt:month}},function(err,funds){
  													if(funds){
  																funds.forEach(function(fund){
   																credit=credit+fund.credit;
   																debit=debit+fund.debit;})
   											Task.find({date:{$lt:today}},function(err,rec){if(rec){

   												res.render("dashboard",{capital:capital,balance:balance,sales:stRec.sales,purchase:stRec.purchase,today:tdy,acc:funds,income:(stRec.income+stRec.rent-credit),expenses:(stRec.expenses-debit),todo:rec});
   											}})
  										

  													}});
    						}else{res.render("dashboard",{capital:capital,balance:"",sales:"",purchase:"",today:tdy,acc:[],income:"",expenses:""});}});



			}
			});


});


// ===========================================================Get Request========================================================//




app.get("/expenditure",function(req,res){
 var today= new Date();
 var tdy=(1+ today.getMonth()) + "/" + (today.getYear()%100);
var month= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 1;

				Account.find({date:{$gte:month}},function(err,expinc){
   						if(expinc){
   						res.render("expenditure",{expinc:expinc});
   						}else{console.log(err);}
   				});
				

});








// ===========================================================Get Request========================================================//



app.get("/bikes", function(req, res){
  			Bike.find({}, function(err, bikeRecordes){
   					res.render("bikes",{bikeRecorde:bikeRecordes,er:""});
		 		});

  });

// ===========================================================Get Request========================================================//


app.get("/addbike",function(req,res){
res.render("addbike",{er:""});
});

// ===========================================================Get Request========================================================//

app.get("/sale/:regs",function(req,res){

		Bike.findOne({registerno:req.params.regs},function(err,foundbike){
				if(foundbike){
						res.render("sale",{registerno:req.params.regs,pera:'sale',buyer:0,bike:foundbike});
					}
					else{console.log(err);}
				});
})

// ===========================================================Get Request========================================================//



app.get("/update/:regs",function(req,res){

			Buyer.findOne({_id:req.params.regs},function(err,foundbike){
				if(foundbike){
						
						res.render("update",{registerno:foundbike.bike.registerno,pera:'Update',buyer:foundbike});
				}
				else
				{
					console.log(err)
				}
			});
});

// ===========================================================Get Request========================================================//

app.get("/accounts",function(req,res){
	var purchase = 0;
	var balance =0;
	var sales=0;
	var credit=0;
	var debit=0;
 var today= new Date();
 var tdy=(1+ today.getMonth());
var month= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 1;
		Buyer.find({sdate:{$gte:month},due :0}, function(err, salesRecordes){
   			if(salesRecordes){Fund.find({date:{$gte:month}},function(err,funds){
   					if(funds){funds.forEach(function(fund){
   						credit=credit+fund.credit;debit=debit+fund.debit;})
   							Account.find({date:{$gte:month}},function(err,AccountRecords){
   								if(AccountRecords){Capital.findOne({date:{$gte:month}}, function(err, capRecordes){
   									if(capRecordes){balance =capRecordes.balance;
										Bike.find({bdate:{$gte:month}}, function(err, bikeRecordes){
				 							if(bikeRecordes){bikeRecordes.forEach(function(price){
   								 					purchase = purchase + price.totalcost;})
				 							Buyer.find({sdate:{$gte:month}}, function(err, salesRecorde){
   												if(salesRecorde){salesRecorde.forEach(function(sale){
   														sales=sales+sale.paid;})
   													Statistics.findOne({month:tdy},function(err,stRec){
    													if(stRec){
res.render("accounts",{salesRecordes:salesRecordes,dailyex:debit,dailyin:credit,acc:AccountRecords,balance:balance,totsale:sales,totpurch:purchase,rent:stRec.rent,date:month});
												}else{console.log(err)}
												});
													}else{console.log(err)}
												});
				 							}
				 						});


   									}
									
									
										});
   									}else{console.log(err);}
   										});
									 }else{console.log(err);}
   												});

   										
   											}else{console.log(err);}
   								});
	
});


// ===========================================================Get Request========================================================//


app.get("/saleList",function(req,res){
	Buyer.find({}, function(err, salesRecordes){
   					res.render("saleList",{salesRecorde:salesRecordes,er:""});
		 		});
});



// ===========================================================Get Request========================================================//



app.get("/updatebike/:regs",function(req,res){
	Bike.findOne({registerno:req.params.regs}, function(err, bikeRecordes){
				 			if(bikeRecordes){
								res.render("updatebike",{bikeR:bikeRecordes,er:""});
							}
							else
							{
								console.log(err);
							}
						});
});

// ===========================================================Get Request========================================================//



app.get("/repurchase/:regs",function(req,res){
	var regs=req.params.regs;
		
		Buyer.findOne({'bike.registerno':regs}, function(err, salesRecordes){
			if(salesRecordes){

							Bikehistory.find({registerno:regs},function(err,result){
							if(result){
										if(result.length==0){
											const bikehist= new Bikehistory({
											bname:salesRecordes.bike.bname,
											mdoel:salesRecordes.bike.model,
											registerno:salesRecordes.bike.registerno,
											chasisno:salesRecordes.bike.chasisno,
											pdate :salesRecordes.bike.bdate,
											from:salesRecordes.bike.seller,
											cost:salesRecordes.bike.totalcost,
											sdate:salesRecordes.sdate,
											to:salesRecordes.name,
											price:salesRecordes.samount
											});bikehist.save();
										}else{
											Bikehistory.updateOne({registerno:regs},{
												$push:{pdate :salesRecordes.bike.bdate,from:salesRecordes.bike.seller,cost:salesRecordes.bike.totalcost,
														sdate:salesRecordes.sdate,to:salesRecordes.name,price:salesRecordes.samount
												},
									},function(err,rCe){if(!err){console.log("success")}});

										}

							}});
								
									
						Buyer.deleteOne({'bike.registerno':regs}, function(err){
							if(!err){
								Bike.deleteOne({registerno:regs}, function(err){
										if(!err){res.redirect("/addbike");}
										});
													
						}
				});


		
		}});

			
});








// ===========================================================Get Request========================================================//


app.get("/history",function(req,res){
	Bikehistory.find({},function(err,history){
		if(history){
			console.log(history)
				res.render("history",{bikes:history,one:""});
		}
	})
});




// ===========================================================Get Request========================================================//

// ===========================================================Get Request========================================================//


app.get("/history/:regs",function(req,res){
	Bikehistory.find({},function(err,history){
		if(history){
					Bikehistory.findOne({registerno:req.params.regs},function(err,oneRecord){
				res.render("history",{bikes:history,one:oneRecord});
			});
		}
	});
});




// ===========================================================Get Request========================================================//

app.get("/rent/:regs",function(req,res){
		Bike.findOne({registerno:req.params.regs},function(err,foundbike){
					if (foundbike) {
						res.render("rent",{bikeR:foundbike});
					}else{
						console.log(err);
					}
			});


			
});
// ===========================================================Get Request========================================================//

app.get("/rent",function(req,res){
		
			Rent.find({},function(err,rentRecorde){
				if(rentRecorde){res.render("rentdata",{rentRecorde:rentRecorde});}
			})


						
			


			
});
// ===========================================================Get Request========================================================//

app.get("/updaterent/:id",function(req,res){

			Rent.findOne({_id:req.params.id},function(err,rentRecorde){
				if(rentRecorde){res.render("updaterent",{bikeR:rentRecorde});}
				else{console.log(err)}
			});
});

// ===========================================================Get Request========================================================//

app.get("/statis",function(req,res){
var purchase = 0;
	var credit=0;
	var debit=0;
	var inccredit=0;
	var expdebit=0;
 var today= new Date();
  var tdy=(1+ today.getMonth());
var month= today.getFullYear() + "-"+ ( today.getMonth()) + "-" + 31;
Fund.find({date:{$gte:month}},function(err,funds){
   		if(funds){
   				funds.forEach(function(fund){
   							credit=credit+fund.credit;
   							debit=debit+fund.debit;})
   							
							Account.find({date:{$gte:month}},function(err,expinc){
   									if(expinc){
   								expinc.forEach(function(acc){
   										inccredit=inccredit+acc.credit;
   										expdebit=expdebit+acc.debit;})
   								
   											Statistics.find({month:tdy},function(err,stRec){
    							if(stRec){
    								
    									if(stRec.length==0){
    										statis = new Statistics({
    										date:month,
    									expenses:expdebit+debit,
    									income:inccredit+credit,
    										month:tdy
    									});
    									statis.save();
    									}
    									else{
    											Statistics.updateOne({month:tdy},{expenses:expdebit+debit,income:inccredit+credit},function(err,res){if(!err){

    												

    											}else{console.log(err);}});
    									
    									}

    							}
    								else{console.log("No Data")}
    						});



   															}
   														});
   															
   													}else{console.log(err);}
   												});
   													
	res.redirect("/");

});



// ===========================================================Get Request========================================================//

app.get("/statistics",function(req,res){

var today= new Date();
  var tdy=(1+ today.getMonth());

Statistics.findOne({month:tdy},function(err,stRec){
    		if(stRec){

			res.render("statistics",{statis:stRec,oldrec:""});
														
						}else{res.render("statistics",{statis:[],oldrec:""});}
					});
});


// ===========================================================Get Request========================================================//





// ===========================================================Post Request========================================================//


app.post("/delete",function(req,res){
Task.deleteOne({_id:req.body.idchk},function(err,res){
	if(err){
		console.log(err);
	}
});
res.redirect("/");
});





// ===========================================================Post Request========================================================//

app.post("/search/account",function(req,res){
	var purchase = 0;
	var balance =0;
	var sales=0;
	var credit=0;
	var debit=0;
 var today= new Date(req.body.month);
 var tdy=(1+ today.getMonth());
var month= today.getFullYear() + "-"+ (1+today.getMonth()) + "-" + 1;
var betmonth= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 31;
		Buyer.find({sdate:{$gte:month, $lt : betmonth},due :0}, function(err, salesRecordes){
   			if(salesRecordes){Fund.find({date:{$gte:month, $lt : betmonth}},function(err,funds){
   					if(funds){funds.forEach(function(fund){
   						credit=credit+fund.credit;debit=debit+fund.debit;})
   							Account.find({date:{$gte:month, $lt : betmonth}},function(err,AccountRecords){
   								if(AccountRecords){Capital.findOne({date:{$gte:month}}, function(err, capRecordes){
   									if(capRecordes){balance =capRecordes.balance;
										Bike.find({bdate:{$gte:month, $lt : betmonth}}, function(err, bikeRecordes){
				 							if(bikeRecordes){bikeRecordes.forEach(function(price){
   								 					purchase = purchase + price.totalcost;})
				 							Buyer.find({sdate:{$gte:month, $lt : betmonth}}, function(err, salesRecorde){
   												if(salesRecorde){salesRecorde.forEach(function(sale){
   														sales=sales+sale.paid;})
   													Statistics.findOne({month:tdy},function(err,stRec){
    													if(stRec){
res.render("accounts",{salesRecordes:salesRecordes,dailyex:debit,dailyin:credit,acc:AccountRecords,balance:balance,totsale:sales,totpurch:purchase,rent:stRec.rent,date:month});
												}else{console.log(err)}
												});
													}else{console.log(err)}
												});
				 							}
				 						});


   									}
									
									
										});
   									}else{console.log(err);}
   										});
									 }else{console.log(err);}
   												});

   										
   											}else{console.log(err);}
   								});
	
});






// ===========================================================Post Request========================================================//

app.post("/rent",function(req,res){
var accmonth=0;
var today= new Date(req.body.hdate);
var month= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 1;
var betwmonth= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 31;
var tdy=(1+ today.getMonth());
if(req.body.due==0){accmonth=tdy}
if(req.body.hdate){today=req.body.hdate}

bikerent =new Rent({
	bname :req.body.bname,
	registerno:req.body.registerno,
	name:req.body.name,
	contact :req.body.contact,
	hdate: today,
	rdate:req.body.rdate,
	rate:req.body.rate,
	receive:req.body.receive,
	due:req.body.due,
	note:req.body.note,
	cleardue:accmonth,
	status:"true"
});



bikerent.save(function(err){
	if(!err){	
					
    		Statistics.find({month:tdy},function(err,stRec){
    			if(stRec){
    				if(stRec.length==0){
    						statis = new Statistics({
    										date:month,
    										rent:req.body.receive,
    										month:tdy
    								});
    									statis.save();
    									
    								}else{
    									Statistics.updateOne({month:tdy},{$inc:{'rent':req.body.receive}},function(err,res){if(!err){console.log(res);}else{console.log(err);}});
    									
    								}
    												
    				   }	
    	
    	});
    		






		Bike.updateOne({registerno:req.body.registerno},{rent:"true"},function(err,foundbike){
    				if(foundbike){ res.redirect("/rent");}
    				});
       			
	}
})

});






// ===========================================================Post Request========================================================//


app.post("/updaterent",function(req,res){
		var accmonth="0";
		var ret=req.body.return;
		var today= new Date();
		var month= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 1;
 		var tdy=(1+ today.getMonth());
 		var due=req.body.due;
 		var rentrec=req.body.receive-req.body.oldrec;
if(!req.body.due){due=0;}
if(due===0){accmonth=tdy;}
if(req.body.rdate){today=req.body.rdate}
if(!req.body.return){ret="true"}
	Rent.updateOne({_id:req.body.id},{
			name:req.body.name,
			contact :req.body.contact,
			hdate:req.body.hdate,
			rdate: today,
			rate:req.body.rate,
			receive:req.body.receive,
			due:due,
			note:req.body.note,
			cleardue:accmonth,
			status:ret

	},function(err,rentdata){
		if(rentdata){
						
						Statistics.find({month:tdy},function(err,stRec){
    			if(stRec){
    				if(stRec.length==0){
    						statis = new Statistics({
    										date:month,
    										rent:req.body.receive,
    										month:tdy
    								});
    									statis.save();
    									
    								}else{
    									Statistics.updateOne({month:tdy},{$inc:{'rent':rentrec}},function(err,res){if(!err){console.log(res);}else{console.log(err);}});
    									
    								}
    												
    				   }else{console.log(err)}
    	
    	});

				if(req.body.return=="false"){
				Bike.updateOne({registerno:req.body.registerno},{rent:"false"},function(err,foundbike){
    				if(foundbike){ res.redirect("/rent");}});}
	}
});

});














// ===========================================================Post Request========================================================//

app.post("/addbike",function(req,res){
var rc=req.body.rc;
var rec=req.body.recieve;
var purchase=0;
var today= new Date(req.body.bdate);
 var tdy=(1+ today.getMonth()) + "/" + (today.getYear()%100);
var month= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 1;
var acc=(1+ today.getMonth());
if(!req.body.rc){rc="false"}
if(!req.body.recieve){rec="false"}
 const bike = new Bike({
	bname :req.body.bname,
	model : req.body.model,
	chasisno : req.body.chasisno,
	registerno: req.body.registerno,
	seller: req.body.seller,
	bdate: req.body.bdate,
	pamount: req.body.pamount,
	jobcard: req.body.jobcard,
	tranfer: req.body.transfer,
	jcref: req.body.jcref,
	totalcost: req.body.totalcost,
	ledger:req.body.ledger,
	note: req.body.note,
	rc: rc,
	receive:rec,
	purchasemonth:acc,
	status:"Available"
  });

  bike.save(function(err){
    if (!err){
    		Statistics.find({month:acc},function(err,stRec){
    				if(stRec){
    					if(stRec.length==0){
    						statis = new Statistics({
    								date:month,
    								purchase:req.body.totalcost,
    								month:acc
    							});
    							statis.save();
    							}
    							else{
    								Statistics.updateOne({month:acc},{$inc:{purchase:req.body.totalcost}},function(err,res){if(!err){console.log(res);}else{console.log(err);}});
    								}

    							}
    			
    				});
    	
       res.render("addbike",{er:"Successfully Added"});
    }else{
    		 res.render("addbike",{er:"Already Exists!"});
    }
  });
});


// ===========================================================Post Request========================================================/


app.post("/updatebike",function(req,res){
const bike = new Bike();
var rc=req.body.rc;
var rec=req.body.receive;
var purchase=req.body.totalcost-req.body.oldcost;
var today=  new Date(req.body.bdate);
 var tdy=(1+ today.getMonth()) + "/" + (today.getYear()%100);
var month= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 1;
var acc=(1+ today.getMonth());
if(!req.body.rc){rc="false"}
if(!req.body.receive){rec="false"}

		Bike.updateOne({registerno:req.body.registerno},{
	seller: req.body.seller,
	pamount: req.body.pamount,
	jobcard: req.body.jobcard,
	tranfer: req.body.transfer,
	jcref: req.body.jcref,
	totalcost: req.body.totalcost,
	ledger:req.body.ledger,
	note: req.body.note,
	rc: rc,
	receive:rec,
	status:"Available"
  },function(err,result){
  		if(result){
    		Statistics.find({month:acc},function(err,stRec){
    				if(stRec){
    					if(stRec.length==0){
    						statis = new Statistics({
    								date:month,
    								purchase:req.body.totalcost,
    								month:acc
    							});
    							statis.save();
    							}
    							else{
    								Statistics.updateOne({month:acc},{$inc:{purchase:purchase}},function(err,res){if(!err){console.log(res);}else{console.log(err);}});
    								}

    							}
    			
    				});
    	
  			res.redirect("bikes")}
  			else{
  				console.log(err);
  			}
  })
});














// ===========================================================Post Request========================================================/


app.post("/capital",function(req,res){
	var oldcapital=req.body.oldc;
	var withdraw=req.body.amount;
	var newcapital=oldcapital-withdraw;
	var date=new Date(req.body.date);
var month= date.getFullYear() + "-"+ (2+ date.getMonth()) + "-" + 1;
var lass=(1+  date.getMonth());
var acc=(2+  date.getMonth());
Statistics.updateOne({month:lass},{status:"true"},function(err,stRecd){
   if(stRecd){
Statistics.find({month:acc},function(err,stRec){
    				if(stRec){
    					if(stRec.length==0){
    						statis = new Statistics({
    								date:month,
    								capital:newcapital,
    								month:acc
    							});
    							statis.save();
    							}
    							else{
    								Statistics.updateOne({month:acc},{capital:newcapital},function(err,res){if(res){console.log(res);;

    								}else{console.log(err);}});
    								}

    							}
    			
    				});

}});

	// const amot= new Capital({
	// 	date : Date.now(),
	// 	balance:req.body.amount
	// });
	// amot.save();
res.redirect("/accounts");
});




// ===========================================================Post Request========================================================/








app.post("/sale",function(req,res){
	var rc=req.body.rc;
	var clearmonth=0;
	var sales=0;
var today=  new Date(req.body.sdate);

var month= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 1;
var acc=(1+ today.getMonth());
var del=req.body.delivered;
if(req.body.amoutdue=="0"){clearmonth=acc}
	
if(!req.body.rc){rc="false"}
if(!req.body.delivered){del="false"}
Bike.findOne({registerno:req.body.regrno},function(err,foundbike){
	if(foundbike){
				Bike.updateOne({registerno:req.body.regrno},{status:'Sold'},function(err,result){
					if(result.nModified===1){
						
			const sell= new Buyer({
				name :req.body.name,
				add : req.body.addr,
				contact : req.body.contact,
				sdate : req.body.sdate,
				samount: req.body.samout,
				transamount:req.body.tansamout,
				paid :req.body.cpaid,
				due : req.body.amoutdue,
				snote :req.body.snote,
				bike: foundbike,
				rc:rc,
				delivery:del,
				guarantee:req.body.guarantee,
				clearmonth: clearmonth,
				salemonth:acc
			
			});
			sell.save(function(err){
    		if (!err){

    						Statistics.find({month:acc},function(err,stRec){
    							if(stRec){
    									if(stRec.length==0){
    										statis = new Statistics({
    										date:month,
    										sales:req.body.cpaid,
    										month:acc
    									});
    									statis.save();
    									}
    									else{
    									Statistics.updateOne({month:acc},{$inc:{'sales':req.body.cpaid}},function(err,res){if(!err){console.log(res);}else{console.log(err);}});
    								}

    							}
    			
    				});
    	
    				Buyer.findOne({'bike.registerno':req.body.regrno},function(err,reC){
    					 res.redirect("/update/"+ reC._id);
    				})

    				
    			}else{
    			console.log(err);
    			}
  			});
					}else{
						console.log(err);
					}
				});

	}else{
						console.log(err);
					}

});

    	
});

// ===========================================================Post Request========================================================/

app.post("/update",function(req,res){

var rc=req.body.rc;
var del=req.body.delivered;
var accmonth=req.body.clearmonth;
var today= new Date();
 var tdy=(1+ today.getMonth());
 var ddate= new Date(req.body.duedate);
 var duedate=(1+ ddate.getMonth());
 var sales=req.body.cpaid-req.body.oldrec;
 var sm=new Date(req.body.buying);
 sd=(1+ sm.getMonth());
var month= today.getFullYear() + "-"+ (1+ today.getMonth()) + "-" + 1;
var acc=(1+ today.getMonth());
if(req.body.amoutdue==0 && req.body.clearmonth==0){if(req.body.buying!=req.body.duedate){accmonth=duedate;}else{accmonth=tdy;}}
if(!req.body.rc){rc="false"}
if(!req.body.delivered){del="false"}
Buyer.updateOne({_id:req.body.id},{
				name :req.body.name,
				add : req.body.addr,
				contact : req.body.contact,
				samount: req.body.samout,
				transamount:req.body.tansamout,
				paid :req.body.cpaid,
				due : req.body.amoutdue,
				snote :req.body.snote,
				rc:rc,
				delivery:del,
				clearmonth : accmonth,
				guarantee:req.body.guarantee
			},function(err,result){
					if(result){
    						Statistics.find({month:duedate},function(err,stRec){
    							if(stRec){

    								if(stRec.length==0){

    									statis = new Statistics({
    										date:month,
    										sales:req.body.cpaid,
    										month:acc
    									});
    									statis.save();
    									
    								}else{

    									 Statistics.updateOne({month:duedate},{$inc:{'sales':sales}},function(err,res){if(!err){console.log(res);}else{console.log(err);}});
    								}

    							}
    			
    				});
						 res.redirect("/saleList");
					}
					else
					{
						console.log(err);
					}
				});

});
// ===========================================================Post Request========================================================/

app.post("/fund/:acct",function(req,res){
	const acc = req.params.acct;
		var funds="";
	var today= req.body.date;
		if(today===""){
			today=new Date();
		}
Fund.find({description:req.body.desc},function(err,recordeFound){
	if(recordeFound){

			if(!recordeFound.length==0){
		if(acc === 'credit'){
			Fund.updateOne({description:req.body.desc},{date:today,credit:req.body.amt},function(err){if(!err){  res.redirect("/statis");}});}
			else{Fund.updateOne({description:req.body.desc},{date:today,debit:req.body.amt},function(err){if(!err){  res.redirect("/statis");}});
		}


 	}else{
			if(acc === "credit"){
				 funds=new Fund({
					date:today,
					description:req.body.desc,
					credit:req.body.amt
					});
			}
		else{
				 funds=new Fund({
					date:Date.now(),
					description:req.body.desc,
					debit:req.body.amt
					});
				
				
		}
			funds.save(function(err){
    		if (!err){
       			 res.redirect("/statis");
    			}else{
    			console.log(err);
    			}
  			});
	}
}
});

});
// ===========================================================Post Request========================================================/

app.post("/expenditure/:acct",function(req,res){
	const acc = req.params.acct;
	var expinc="";
	var today= req.body.date;
		if(today===""){
			today=new Date();
		}
Account.findOne({description:req.body.desc},function(err,recordeFound){
	if(recordeFound){if(acc === 'credit'){
			Account.updateOne({description:req.body.desc},{date:today,credit:req.body.amt},function(err){if(!err){ res.redirect("/statis");}});}
			else{Account.updateOne({description:req.body.desc},{date:today,debit:req.body.amt},function(err){if(!err){ res.redirect("/statis");}});}

	}else{
		if(acc === 'credit'){
				 expinc=new Account({
					date:today,
					description:req.body.desc,
					credit:req.body.amt
					});
			}
		else{
				 expinc=new Account({
					date:Date.now(),
					description:req.body.desc,
					debit:req.body.amt
					});
				
				
		}
			expinc.save(function(err){
    		if (!err){
       			 res.redirect("/statis");
    			}else{
    			console.log(err);
    			}
  			});
	}

		});
});

// ===========================================================Post Request========================================================/

app.post("/task",function(req,res){

		var today= req.body.date;
		if(!req.body.date){
			today=new Date();
		}
			const todo= new Task({
					date:today,
					task:req.body.desc
			});
			todo.save(function(err){
				if(!err){res.redirect("/");}
			});

});






// ===========================================================Post Request========================================================//

app.post("/searchb",function(req,res){
	var para = "";
		if(req.body.para){para=req.body.para}
	var rc="";
		if(req.body.rc){rc=req.body.rc}
	var ava="";
		if(req.body.available){ava=req.body.available}
	var month="";
	
		if(req.body.month){ month=1 + new Date(req.body.month).getMonth();}


if(!rc=="" && !ava==""){
	Bike.find({rc:rc,receive:"true",status:"Available"},function(err,reCorde){
				res.render("bikes",{bikeRecorde:reCorde,er:""});
			})

}
else if(!ava==""){
				if(ava==="rent"){
					Bike.find({rent:"true"},function(err,reCorde){
				res.render("bikes",{bikeRecorde:reCorde,er:""});
								
					});
				}
				else if(ava==="sold"){
					Bike.find({status:"Sold"},function(err,reCorde){
				res.render("bikes",{bikeRecorde:reCorde,er:""});
					});
				}
			else{

			Bike.find({receive:ava,status:"Available"},function(err,reCorde){
				res.render("bikes",{bikeRecorde:reCorde,er:""});
			})
			}
	}
	else if(!rc==""){
			Bike.find({rc:"true"},function(err,reCorde){
				res.render("bikes",{bikeRecorde:reCorde,er:""});
			})
	}

	else if(!para==""){
		Bike.find({seller:{$regex: req.body.para, $options: 'i'}}, function(err,nameRecorde){
					if(nameRecorde){
   					 
							if(nameRecorde==""){ Bike.find({registerno:{$regex: req.body.para, $options: 'i'}}, function(err,regsRecorde){
										if(regsRecorde){if(regsRecorde==""){
												 Bike.find({chasisno:{$regex: req.body.para, $options: 'i'}}, function(err,chasisRecorde){
												 		if(chasisRecorde){if(chasisRecorde==""){res.render("bikes",{bikeRecorde:chasisRecorde,er:"Couldn't Find Data"});}
												 			else{res.render("bikes",{bikeRecorde:chasisRecorde,er:""});}
												 		}
												 });
										}
												else{res.render("bikes",{bikeRecorde:regsRecorde,er:""});}
									}
										
													});

							}
								else{res.render("bikes",{bikeRecorde:nameRecorde,er:""});}


					}
					else
					{
						
						res.render("bikes",{bikeRecorde:nameRecorde,er:"Record Not Found For name"});
					}
   					
		 		});
	}else if(!month==""){
		Bike.find({purchasemonth:month},function(err,reCorde){
				res.render("bikes",{bikeRecorde:reCorde,er:""});
								
					});
	}

		else{
			res.redirect("bikes");
		}

})


// ===========================================================Post Request========================================================/
app.post("/searchs",function(req,res){
		var rc="";
		if(req.body.rc){rc=req.body.rc}
	var del="";
		if(req.body.delivered){del=req.body.delivered}
var para = "";
		if(req.body.para){para=req.body.para}
var month="";
		if(req.body.month){ month=1 + new Date(req.body.month).getMonth();}
if(!rc=="" && !del==""){
	Buyer.find({rc:rc,delivery:del},function(err,reCorde){
				res.render("saleList",{salesRecorde:reCorde,er:""});
			});

}else if(!del==""){
	Buyer.find({delivery:del},function(err,reCorde){
				res.render("saleList",{salesRecorde:reCorde,er:""});
			});
}else if(!para==""){

		Buyer.find({name:{$regex: req.body.para, $options: 'i'}}, function(err,nameRecorde){
					if(nameRecorde){
   					 
							if(nameRecorde==""){ Buyer.find({'bike.registerno':{$regex: req.body.para, $options: 'i'}}, function(err,regsRecorde){
										if(regsRecorde){if(regsRecorde==""){
												 Buyer.find({contact:parseInt(req.body.para)}, function(err,chasisRecorde){
												 		if(chasisRecorde){if(chasisRecorde==""){console.log("Not Found")}
												 			else{res.render("saleList",{salesRecorde:chasisRecorde,er:""});}
												 	
												 		}else{res.render("saleList",{salesRecorde:regsRecorde,er:"Couldn't Find Data!!"});}
												 });
										}
												else{res.render("saleList",{salesRecorde:regsRecorde,er:""});}
									}
										
													});

							}
								else{res.render("saleList",{salesRecorde:nameRecorde,er:""});}


					}
					else
					{
						
						res.render("saleList",{salesRecorde:nameRecorde,er:"Record Not Found For name"});
					}
   					
		 		});




}else if(!month==""){
			Buyer.find({salemonth:month},function(err,reCorde){
				res.render("saleList",{salesRecorde:reCorde,er:""});
			});
	}else{
			res.redirect("saleList");
		}

});

// ===========================================================Post Request========================================================/

app.post("/rent/search",function(req,res){

var amt="";
		if(req.body.amt){amt=req.body.amt}
	var retrn="";
		if(req.body.retrne){retrn=req.body.retrne}
var para = "";
		if(req.body.para){para=req.body.para}
var month="";
		if(req.body.month){ month= new Date(req.body.month);}
var d =new Date(req.body.month);
d.setDate(month.getDate() + 29);
if(!amt=="" && !retrn==""){
				if(amt=="true"){
						Rent.find({due:{$gt:0},status:retrn},function(err,reCorde){
						 res.render("rentdata",{rentRecorde:reCorde,er:""});
			});
				}else{

					Rent.find({due:0,status:retrn},function(err,reCorde){
				 res.render("rentdata",{rentRecorde:reCorde,er:""});
						});
				}
}else if(!retrn==""){Rent.find({status:retrn},function(err,reCorde){
						 res.render("rentdata",{rentRecorde:reCorde,er:""});
			});
}else if(!para==""){


					Rent.find({name:{$regex: req.body.para, $options: 'i'}}, function(err,nameRecorde){
					if(nameRecorde){
   					 
							if(nameRecorde==""){ Rent.find({registerno:{$regex: req.body.para, $options: 'i'}}, function(err,regsRecorde){
										if(regsRecorde){if(regsRecorde==""){
												 Rent.find({contact:parseInt(req.body.para)}, function(err,chasisRecorde){
												 		if(chasisRecorde){if(chasisRecorde==""){console.log("Not Found")}
												 			else{res.render("rentdata",{rentRecorde:chasisRecorde,er:""});}
												 	
												 		}else{res.render("rentdata",{rentRecorde:regsRecorde,er:"Couldn't Find Data!!"});}
												 });
										}
												else{res.render("rentdata",{rentRecorde:regsRecorde,er:""});}
									}
										
													});

							}
								else{res.render("rentdata",{rentRecorde:nameRecorde,er:""});}


					}
					else
					{
						
						res.render("rentdata",{rentRecorde:nameRecorde,er:"Record Not Found For name"});
					}
   					
		 		});
}else if(!month==""){
		Rent.find({hdate:{$gt:month,$lt:d}},function(err,reCorde){
				
						 res.render("rentdata",{rentRecorde:reCorde,er:""});
			});
	

}else{
			res.redirect("rentdata");
		}




});




// ===========================================================Post Request========================================================/





 app.post("/search/statis",function(req,res){

var month=new Date();
		if(req.body.month){ month= new Date(req.body.month);}
month.setDate(month.getDate()-1);
var today= new Date();
  var tdy=(1+ today.getMonth());

Statistics.findOne({month:tdy},function(err,stRec){
    		if(stRec){
  Statistics.findOne({date:{$gt:month}},function(err,Rec){
   if(Rec){res.render("statistics",{statis:stRec,oldrec:Rec});}else{res.render("statistics",{statis:stRec,oldrec:[]});}});						
					}else{res.render("statistics",{statis:[],oldrec:[]});}
				});


 });



// ===========================================================Post Request========================================================/
let port = process.env.PORT;
if(port == null || port == ""){port = 3000;}
app.listen(port, function() {
  console.log("Server started Successfully");
});
