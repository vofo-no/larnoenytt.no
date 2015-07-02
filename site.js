$(function() {
	$(document).on('click','.navbar-collapse.in',function(e) {
		if( $(e.target).is('a') ) {
			$(this).collapse('hide');
		}
	});

	var Question = Backbone.Model.extend({
    defaults: function() {
      return {
				number: 0,
        question: "empty q",
        options: ["no", "yes"],
        correct: "yes",
				is_correct: false,
				answer: null
      };
    }
  });

	var QuestionList = Backbone.Collection.extend({
    model: Question,
    localStorage: new Backbone.LocalStorage("vofoquiz-arendalsuka2015"),
    remaining: function() {
      return this.where({answer: null});
    },
		correct: function() {
      return this.where({is_correct: true});
    },
    comparator: 'number'
  });

	var Questions = new QuestionList();

	var QuestionView = Backbone.View.extend({
    tagName:  "div",
    template: _.template($('#item-template').html()),
    events: {
      "click .answer"   : "answer",
      "click .question"  : "showQuestion"
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$('.quiz').hide();
      this.$('.fact').show();
      return this;
    },
		showQuestion: function() {
			this.$('.quiz').show();
      this.$('.fact').hide();
		},
    answer: function() {
      var value = this.$('input[name=answr]:checked').val();
			if (!value) {
				this.$('.text-danger').text('Vennligst velg et svar.');
			} else {
				var is_correct = this.model.get('correct') == value;
				this.model.save({answer: value, is_correct: is_correct});
			}
    }
  });

	var AppView = Backbone.View.extend({
    el: $("#quizapp"),
		successTemplate: _.template($('#success-template').html()),
    events: {
      "click .retry": "toggleAllUnanswered"
    },

    initialize: function() {
      this.listenTo(Questions, 'all', this.render);
      this.main = $('#quizapp-main');
      Questions.fetch();
			if (!Questions.length) {
				$.getJSON('quiz.json', function(data) {
					for(var i = 0;i < data.length;i++) {
						Questions.create(data[i]);
					}
				});
			}
    },

    render: function() {
			var remaining = Questions.remaining().length;
			var correct = Questions.correct().length;

      if (remaining) {
				var view = new QuestionView({model: Questions.remaining()[0]});
				this.main.empty();
				this.main.append(view.render().el);
      } else {
				this.main.html(this.successTemplate({correct: correct }));
      }
    },

		toggleAllUnanswered: function() {
			Questions.each(function(question){
				question.save({'answer':null, 'is_correct':false});
			});
		}

  });

  var App = new AppView();

});
