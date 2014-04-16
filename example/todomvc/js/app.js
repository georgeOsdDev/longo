/*global jQuery, Handlebars, Longo, Router */
jQuery(function ($) {
	"use strict";

	Handlebars.registerHelper("eq", function(a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		pluralize: function (count, word) {
			return count === 1 ? word : word + "s";
		}
	};

	var App = {
		init: function () {
			var self = this;
			this.cacheElements();
			this.bindEvents();

			Longo.setRoot();
			this.db = new Longo.DB("todos-longo");
			this.db.collection("tasks").find({}).sort({"_id":1}).onValue(function(error, results){
				self.allTodoCount = results.length;
				self.allTodos     = results;
				self.render();
			});

			this.db.collection("tasks").find({"completed":true}).onValue(function(error, results){
				self.completedTodoCount = results.length;
				self.completedTodos     = results;
				if(self.filter === "completed"){
					self.render(results);
				} else {
					self.renderFooter();
				}
			});

			this.db.collection("tasks").find({"completed":false}).onValue(function(error, results){
				self.activeTodoCount = results.length;
				self.activeTodos     = results;
				if(self.filter === "active"){
					self.render(results);
				} else {
					self.renderFooter();
				}
			});

			this.db.collection("filter").insert({"_id":0, filter:"all"}).done();
			this.db.collection("filter").find().limit(1).onValue(function(error, results){
				self.filter = results[0].filter;
				self.render();
			});

			Router({
				"/:filter": function (filter) {
					this.db.collection("filter").update({},{"filter":filter}).done();
				}.bind(this)
			}).init("/all");
			this.db.collection("tasks").parsist();
		},

		cacheElements: function () {
			this.todoTemplate = Handlebars.compile($("#todo-template").html());
			this.footerTemplate = Handlebars.compile($("#footer-template").html());
			this.$todoApp = $("#todoapp");
			this.$header = this.$todoApp.find("#header");
			this.$main = this.$todoApp.find("#main");
			this.$footer = this.$todoApp.find("#footer");
			this.$newTodo = this.$header.find("#new-todo");
			this.$toggleAll = this.$main.find("#toggle-all");
			this.$todoList = this.$main.find("#todo-list");
			this.$count = this.$footer.find("#todo-count");
			this.$clearBtn = this.$footer.find("#clear-completed");
		},

		bindEvents: function () {
			var list = this.$todoList;
			this.$newTodo.on("keyup", this.create.bind(this));
			this.$toggleAll.on("change", this.toggleAll.bind(this));
			this.$footer.on("click", "#clear-completed", this.destroyCompleted.bind(this));
			list.on("change", ".toggle", this.toggle.bind(this));
			list.on("dblclick", "label", this.edit.bind(this));
			list.on("keyup", ".edit", this.editKeyup.bind(this));
			list.on("focusout", ".edit", this.update.bind(this));
			list.on("click", ".destroy", this.destroy.bind(this));
		},

		render: function () {
			var data = [];
			switch(this.filter){
			case "active":
				data = this.activeTodos;
				break;
			case "completed" :
				data = this.completedTodos;
				break;
			default :
				data = this.allTodos;
				break;
			}

			this.$todoList.html(this.todoTemplate(data));
			this.$main.toggle(data.length > 0);
			this.renderFooter();
			this.$newTodo.focus();
		},

		renderFooter: function () {
			var template = this.footerTemplate({
				activeTodoCount: this.activeTodoCount,
				activeTodoWord: util.pluralize(this.activeTodoCount, "item"),
				completedTodos: this.completedTodoCount,
				filter: this.filter
			});

			this.$footer.toggle(this.allTodoCount > 0).html(template);
		},

		toggleAll: function () {
			var completed = this.$toggleAll.prop("checked");
			this.db.collection("tasks").update({},{"$set":{"completed":completed}},{"multi":true}).done();
		},

		destroyCompleted: function () {
			this.db.collection("tasks").remove({"completed":true}).done();
		},

		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}
			this.db.collection("tasks").insert({"title":val, completed:false}).done();
			$input.val("");
		},

		toggle: function (e) {
			var li = $(e.target).closest("li");
			var id = li.data("id");
			var completed = li.hasClass("completed");
			this.db.collection("tasks").update({"_id":id}, {"$set":{"completed":!completed}}).done();
		},

		edit: function (e) {
			var $input = $(e.target).closest("li").addClass("editing").find(".edit");
			$input.val($input.val()).focus();
		},

		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				$(e.target).data("abort", true).blur();
			}
		},

		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();

			if ($el.data("abort")) {
				$el.data("abort", false);
				this.render();
				return;
			}

			var li = $el.closest("li");
			var id = li.data("id");

			if (val) {
				this.db.collection("tasks").update({"_id":id}, {"$set": {"title":val}}).done();
			} else {
				this.db.collection("tasks").remove({"_id":id}).done();
			}
		},

		destroy: function (e) {
			var el  = e.target;
			var $el = $(el);
			var li  = $el.closest("li");
			var id  = li.data("id");
			this.db.collection("tasks").remove({"_id":id}).done();
		}
	};

	App.init();
	window.App = App;
});
