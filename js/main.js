  var Olog = {
    initiate: function(olog, host_document) {
      //Remove all context menus
      olog.record.request(olog, "shown_context_menus").map(function(context_menu_id) {
        host_document.getElementById("page__bucket").appendChild(host_document.getElementById(context_menu_id));
      });
    },
    record: {
      data: {
        shown_context_menus: []
      },
      register: function(olog, requested_attribute, replacing_value) {
        olog.record.data[requested_attribute] = replacing_value;
      },
      request: function(olog, requested_attribute) {
        return olog.record.data[requested_attribute];
      }
    },
    modal: {
      create: function(host_document, modal_json) {

      },
      destroy: function() {

      }
    },
    authentication_listener: {
      initiate: function(host_location, firebase, custom_handler) {

        var handler;

        if (custom_handler) {
          handler = custom_handler;
        } else {
          handler = function(user) {
            if (user) {
              if (host_location.href === 'oauth.html') {
                host_location.href = 'dashboard.html';
              }
            } else {
              host_location.href = 'oauth.html';
            }
          };
        }

        firebase.auth().onAuthStateChanged(handler)
      }
    },
    context_menu: {
      initiate: function(olog, host_document, context_menu_manifest) {

        const context_menu_object = {};
        let context_menu_element = '';
        let context_menu_option = '';
        let context_menu_option_name = '';
        let compiled_triggers = [];

        //Remove all context menus
        olog.record.request(olog, "shown_context_menus").map(function(context_menu_id) {
          host_document.getElementById("page__bucket").appendChild(host_document.getElementById(context_menu_id));
        });

        //JSON Normalization
        if (typeof context_menu_manifest === 'string') {
          context_menu_object = JSON.parse(context_menu_manifest);
        } else {
          context_menu_object = context_menu_manifest;
        }

        context_menu_object.data.map(function(context_menu) {
          //Build context menu

          context_menu_element = '<div id="&context-menu__"' + context_menu.name + ' class="--no-show t__context-menu" data-reference=""></div>'

          //Build individual options
          context_menu.options.map(function(option) {

            //Get context menu option name
            context_menu_option_name = option.content;
            //Root out all spaces
            context_menu_option_name = context_menu_option_name.split(' ');
            context_menu_option_name = context_menu_option_name.join('-').trim();

            if (document.getElementById('&context-menu__' + context_menu.name)) {

              context_menu_option = '<input type="button" class="t__context-menu-option" id="' + context_menu.name + '__' + context_menu_option_name + '" value="' + option.content + '">'

              host_document.getElementById('&context-menu__' + context_menu.name).innerHTML = context_menu_option;

              host_document.getElementById('&context-menu__' + context_menu.name).addEventListener("click", function() {
                option.handler(host_document, host_document.getElementById("&context-menu__" + context_menu.name).parentNode.getAttribute("data-reference"), firebase);

                //Remove all context menus
                olog.record.request(olog, "shown_context_menus").map(function(context_menu_id) {
                  host_document.getElementById("page__bucket").appendChild(host_document.getElementById(context_menu_id));


                  olog.record.register(olog, "shown_context_menus", (olog.record.request(olog, "shown_context_menus")).splice((olog.record.request(olog, "shown_context_menus")).indexOf(context_menu_id)), 1);
                });
              });
            }

          });

          host_document.getElementById('page__bucket').innerHTML += context_menu_element;


          //Record the context menu        olog.record.register(olog, "shown_context_menus",  ollog.record.request(olog, "shown_context_menus")).push('&context-menu__' + context_menu.name));

          //Compile a list of triggers
          context_menu.triggers.map(function(trigger) {
            if (trigger.substr(0, 1) === '.') {
              compiled_triggers.concat(host_document.querySelectorAll(trigger));
            } else if (trigger.substr(0, 1) === "#") {
              compiled_triggers.push(host_document.querySelector(trigger));
            } else {
              compiled_triggers.push(host_document.getElementById(trigger));
            }
          });

          //Register context menu
          compiled_triggers.map(function(trigger) {
            trigger.addEventListener("contextmenu", function(default_event) {
              default_event.preventDefault();

              //Remove all context menus
              olog.record.request(olog, "shown_context_menus").map(function(context_menu_id) {
                host_document.getElementById("page__bucket").appendChild(host_document.getElementById(context_menu_id));

                olog.record.register(olog, "shown_context_menus", (olog.record.request(olog, "shown_context_menus")).splice((olog.record.request(olog, "shown_context_menus")).indexOf(context_menu_id)), 1);
              });

            })
          });

        });



      }
    },
    account_dropdown: {
      initiate: function(host_document, tippy, account_dropdown_manifest) {

      }
    },
    manager: {
      initiate: function(host_document, firebase, bindings_manifest) {

        let bindings_object = {};

        if (typeof bindings_manifest === "string") {
          bindings_object = JSON.parse(bindings_manifest);
        } else {
          bindings_object = bindings_manifest;
        }

        bindings_object.content.map(function(bind) {
          firebase.database().ref(bind.reference).on("value")
        });

      }
    },
    announce: function(host_document, announcement_type, announcement_message) {
      //Announce
    }
  }