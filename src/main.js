var _ = require('lodash');
var Bacon = require('baconjs');

var App = function(){

	this._setupCastReceiver();
	this._messageBus.onMessage = this._onMessage.bind(this);

	this._card = document.getElementById('card');
	this._stopper = new Bacon.Bus();
};

_.extend(App.prototype, {

	_setupCastReceiver: function(){
		cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
		this._castReceiver = cast.receiver.CastReceiverManager.getInstance();

		this._messageBus = this._castReceiver.getCastMessageBus('urn:x-cast:simple-flashcard');

		/**
		* Application config
		**/
		var appConfig = new cast.receiver.CastReceiverManager.Config();

		/**
		* Text that represents the application status. It should meet
		* internationalization rules as may be displayed by the sender application.
		* @type {string|undefined}
		**/
		appConfig.statusText = 'Ready to play';

		/**
		* Maximum time in seconds before closing an idle
		* sender connection. Setting this value enables a heartbeat message to keep
		* the connection alive. Used to detect unresponsive senders faster than
		* typical TCP timeouts. The minimum value is 5 seconds, there is no upper
		* bound enforced but practically it's minutes before platform TCP timeouts
		* come into play. Default value is 10 seconds.
		* @type {number|undefined}
		**/
		// 100 minutes for testing, use default 10sec in prod by not setting this value
		appConfig.maxInactivity = 6000;
		/**
		* Initializes the system manager. The application should call this method when
		* it is ready to start receiving messages, typically after registering
		* to listen for the events it is interested on.
		*/
		this._castReceiver.start(appConfig);
	},

	_onMessage: function(message){
		var data = JSON.parse(message.data);

		this._startShowing(data);
	},

	_startShowing: function(data){
		this._stopper.push(null);

		document.body.classList.remove('active');
		var activate = _.once(function(){
			document.body.classList.add('active');
		});

		this._card.style.display = '';
		var interval = data.interval;

		var words = data.words;
		var card = this._card;

		Bacon.interval(interval, null)
			 .takeUntil(this._stopper)
			 .map(function(){
			 	var index = Math.floor(Math.random() * words.length);
			 	return words[index];
			 })
			 .onValue(function(word){
			 	activate();
			 	card.textContent = word;
			 });
	}

});


window.app = new App();
