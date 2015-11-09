requirejs(['domReady',
	'pub/iptFormat',
	'checkbox',
	'pub/trace',
	'pub/router',
	'pub/moneyParse',
	'pub/validate',
	'pub/clearSpace',
	'pub/fetchPayInfo',
	'pub/fetchCardMakeOut',
	'switchModel',
	'listSupportBanks',
	'disableVerifyBtn',
	'pub/fetchSendQpayMs'
	],
	function(domReady,
		iptFormat,
		checkbox,
		trace,
		router,
		moneyParse,
		validate,
		clearSpace,
		fetchPayInfo,
		fetchCardMakeOut,
		switchModel,
		listSupportBanks,
		disableVerifyBtn,
		fetchSendQpayMs
		){
	domReady(function () {
		
		var qpayInfoApi  ;

		function Model(){
			var self = this;

			//filter
			self.f={
				getLast4Code: getLast4Code,
				getCardTypeName : getCardTypeName
			}

			//banner ctrl
			self.bannerAvailable = ko.observable(true);
			self.bannerText = ko.observable('欢迎使用唯品会快捷支付功能，绑定银行卡后即可支付！');
			//dashShowDef
			self.dashDefStyle = ko.observable('block');
			self.dashStyle = ko.observable('none');

			//dash content
			self.orderAmount = ko.observable('');

			self.walletBalance = ko.observable('19.00');
			self.walletBalanceAvailibale = ko.observable(true);

			self.redPacketAvailibale = ko.observable(true);
			self.redPacketTotal = ko.observable('19.00');

			self.bankCardText = ko.observable('使用新银行卡进行支付'); //未绑卡+（红包可用||余额不为0） 使用新卡
			//self.bankCardText = ko.observable('工商银行 储蓄卡 <strong> (**8889)</strong>');

			//控制dash展示
			self.dashStatusCode = ko.observable(1); //0 1 2 4
			//控制输入框展示
			self.payPassCode = ko.observable(1); //0 1 2

			//控制按钮显示
			self.btnPayCode = ko.observable(0); // 0 1

			//控制支持的银行显示
			self.supportBanksShow = ko.observable(true); // true false

			//银行列表
			self.bankList = ko.observableArray([]);

			self.supportBankList = ko.observableArray([]);
			self.supportBankHasTypesCnt = ko.observable(0); 
			self.supportBankOneTypeText = ko.observable(''); 
			self.supportBankListObj = {};

			

			//non observable obj
			//checkbox value
			self.chkBalance = true;
			self.chkPacket = true;
			self.chkBank = true;
			//validate code
			self.validateCode;
			

			//event click
			self.showBankList = showBankList;
			self.hideBankList = hideBankList;
			self.showSupportBankList = showSupportBankList;
			self.hideSupportBankList = hideSupportBankList;

			self.checkboxDom = checkboxDom;
			self.bankSelect = bankSelect;
			self.nextStep = nextStep;
			self.surePay = surePay;
			self.getValidaCode = getValidaCode;

			self.switchSupportBankTabs = switchSupportBankTabs;
		}
		var model = new Model();

	    ko.applyBindings(model,$('#home')[0]);

	   
	    fetchPayInfo(function(data){
			model.dashDefStyle('none');
	    	model.dashStyle('block');
	    	//缓存数据
	    	qpayInfoApi = data;
	    	dashStatusCode(data);
	    })

	    
	    
	    
		
	   
	    

	    function dashStatusCode(qpayInfoApi){
	    	//
	    	/**
	    	未绑卡 + 红包不可用 + 余额为0   ——》首次绑页面
	    	未绑卡 + 红包可用 || 余额不为0  ——》使用新卡
			已绑卡 + 余额为0 ——》余额不可用
			已绑卡 + 余额不为0 ——》余额可用
	    	**/
	    	var data = qpayInfoApi.data,
	    		notBindCard,// 是否绑卡
	    		redPacketAvailibale, //红包
	    		bankCardText
	    		;

	    	notBindCard = data.banks.length===0; //是否绑卡
	    	redPacketAvailibale = data.supportRedPacket===1&&data.redPacketTotal>0;//红包是否可用
	    	walletBalanceAvailibale = data.walletBalance>0;//余额是否可用

	    	filterBanks(qpayInfoApi);

	    	//未绑卡 + 红包不可用 + 余额为0   ——》首次绑页面
	    	if(notBindCard && !redPacketAvailibale && !walletBalanceAvailibale){
	    		model.dashStatusCode(0);
	    		model.payPassCode(0);
	    		model.btnPayCode(0);
	    		model.supportBanksShow(true);
	    		model.orderAmount(moneyParse(data.orderAmount));
	    		listSupportBanks(model);
	    		return false;
	    	}
	    	//未绑卡 + 红包可用 || 余额不为0  ——》使用新卡
	    	else if(notBindCard && (redPacketAvailibale || walletBalanceAvailibale)){
	    		model.dashStatusCode(1);
	    		model.payPassCode(1);
	    		model.btnPayCode(0);
	    		bankCardText = '使用新银行卡进行支付';
	    		
	    	}
	    	//已绑卡 + 余额为0 ——》余额不可用
	    	else if(!notBindCard && !walletBalanceAvailibale){
	    		model.dashStatusCode(2);
	    		model.payPassCode(2);
	    		model.btnPayCode(1);
	    		bankCardText = getBankCardText(data.banks[0]);
	    	}
	    	//已绑卡 + 余额不为0 ——》余额可用
	    	else if(!notBindCard && walletBalanceAvailibale){
	    		model.dashStatusCode(3);
	    		model.payPassCode(2);
	    		model.btnPayCode(1);
	    		bankCardText = getBankCardText(data.banks[0]);
	    	}
	    	model.bankCardText(bankCardText);
	    	model.redPacketAvailibale(redPacketAvailibale);

	    	model.walletBalanceAvailibale(walletBalanceAvailibale);
	    	model.walletBalance(data.walletBalance);
	    	model.chkBalance = walletBalanceAvailibale;
			
	    	model.bankList(data.banks);
	    	model.supportBanksShow(false);

	    }
	    function filterBanks(qpayInfoApi){
	    	var bks = [];
	    	$.each(qpayInfoApi.data.banks,function(i,e){
	    		if(e.payMode===2&&e.enabled===1){
	    			e.active = i===0?'active':'';
	    			bks.push(e);
	    		}
	    	});
	    	qpayInfoApi.data.banks = bks;
	    }
	    function getBankCardText(bankItem){
	    	return bankItem.bankName 
	    			+ ' '
	    			+ getCardTypeName(bankItem.cardType)
	    			+ ' '
	    			+ '<strong> (**'
	    			+ getLast4Code(bankItem.cardNo)
	    			+')</strong>';
	    }
	    function getLast4Code(input){
			var l = input.length;
			if(l<4){
				return input;
			}
			else{
				
				return input.substring(l-4);
			}
		}
		function getCardTypeName(input){
			return input===1?'储蓄卡':'信用卡';
		}

		function showBankList(){
			switchModel.show('#banklist');
		}
		function hideBankList(){
			switchModel.hide('#banklist')
		}

		function showSupportBankList(){
			switchModel.show('#supportBanks');
		}
		function hideSupportBankList(){
			switchModel.hide('#supportBanks');
		}


		function bankSelect(index){
			var str;
			if(index==='newCard'){//新卡
				str = '使用新银行卡进行交易';
				model.payPassCode(1);
	    		model.btnPayCode(0);
			}
			else{
				str = getBankCardText(qpayInfoApi.data.banks[index]);
				model.payPassCode(2);
	    		model.btnPayCode(1);
			}
			rebuildBankListData(index);
			model.bankCardText(str);
			hideBankList();
		}

		function rebuildBankListData(index){
			$.each(qpayInfoApi.data.banks,function(i,e){
				e.active = i==index?'active':'';
			});
			model.bankList([]);
			model.bankList(qpayInfoApi.data.banks);
		}

		function checkboxDom(data,event){
			var $chk = $(event.target).parent('.checkbox'),
				val ;
			checkbox.switchs($chk);
			val = checkbox.get($chk);
			
			if($(event.target).parents('.pay-balance-row').length>0){
				model.chkBalance = val;
			}	
			else if($(event.target).parents('.pay-packet-row').length>0){
				model.chkPacket = val;
			}
			else if($(event.target).parents('.pay-bank-card').length>0){
				model.chkBank = val;
			}

		}

		function surePay(){

		}
		function nextStep(d,e){
			if($(e.target).hasClass('btn-disabled')){
				return false;
			}
			//未绑卡 + 红包不可用 + 余额为0   ——》首次绑页面
			if(model.dashStatusCode()===0){
				var cardNo = $('#cardNo').val();
				cardNo = clearSpace(cardNo);
				var msg = validate.checkCardNo(cardNo);
				if(!msg.rst){
					trace(msg.msg);
					return false;
				}
				var param = {
					cardNo:cardNo
				}

				$(e.target).removeClass('btn-red').addClass('btn-disabled').html('安全加载中...');
				fetchCardMakeOut(param,function(data){
					//case1 识别出来 返回银行信息,支持
					//case2 识别出来 返回银行信息,不支持
					//case3 识别不出来
					$(e.target).removeClass('btn-disabled').addClass('btn-red').html('下一步');
					var url = '',param;
					//case3 识别不出来
					if(data.isSupported===0){
						//case2 识别出来 返回银行信息,不支持
						trace('不支持该卡');
						return false;
					}
					else{
						//case1 识别出来 返回银行信息,支持
						//case3 识别不出来
						param = data;
						param.orderAmount = qpayInfoApi.data.orderAmount;
						param.cardNo = cardNo;
						url = router.stringify('bindcard',param);
						location.hash = url;
					}

				})
			}

		}
		function getWalletPayAmount(){
			return model.chkBalance?qpayInfoApi.data.walletBalance:0;
		}
		function getPacketAmount(){
			return model.chkPacket?qpayInfoApi.data.redPacketTotal:0;
		}
		function getSelectedBankCard(){
			var bankItem;
			$.each(qpayInfoApi.data.banks,function(i,e){
				if(e.active==='active'){
					bankItem =  e;
				}
			});
			return bankItem;
		}

		function getValidaCode(type,data,event){

			if($(event.target).hasClass('v-btn-link-disabled')){
				return false;
			}

			var bankItem = getSelectedBankCard();
			console.log(bankItem)
			var param = {};
			param.type = type;
			param.walletPay = getWalletPayAmount();
			param.redPacketPay = getPacketAmount();
			param.cardPay = qpayInfoApi.data.orderAmount - param.walletPay - param.redPacketPay;
			param.cardId = bankItem.cardId;
			param.mobileNo = qpayInfoApi.data.mobileNo;
			param.fullName = '';
			param.cardNo = bankItem.cardNo;
			param.idNo = qpayInfoApi.data.idNo;
			param.bankCode = bankItem.bankCode;
			param.cardType = bankItem.cardType;
			param.validity = '';
			param.cvv2 = '';

			fetchSendQpayMs(param,function(data){
				trace('验证码已经发送至:<br>'+param.mobileNo);
				disableVerifyBtn($(event.target));

			})
			
		}


		
		function switchSupportBankTabs(cardType,d,e){
			$(e.target).addClass('active').siblings().removeClass('active');
			if(cardType==1){
				model.supportBankList(model.supportBankListObj.type1);
			}
			else if(cardType==2){
				model.supportBankList(model.supportBankListObj.type2);
			}
		}
		//格式化卡号输入
		$('.dash-ipt').on('input',function(e){
			var target = e.target,
				value,
				newVal;
			if($(target).attr('id')==='cardNo'){
				value = $(e.target).val()+'';
				newVal =  iptFormat(value,'card_split');
				$(target).val(newVal);
			}
		});
		//卡号校验
		$('.dash-ipt').on('change',function(e){
			var target = e.target,
				value,
				newVal;
			console.log('aa')
			if($(target).attr('id')==='cardNo'){
				value = $(e.target).val()+'';
				value = clearSpace(value);
				console.log('bb')
				var msg = validate.checkCardNo(value);
				console.log(msg)
				if(!msg.rst){
					trace(msg.msg);
					return false;
				}
			}
		});
		//
		$('#cardNo').on('input',function(e){
			var value = $(e.target).val()+'';
			var newVal =  iptFormat(value,'card_split')
			$(e.target).val(newVal)
		});



		
		

	});
});