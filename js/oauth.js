//Authentication Gate
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    window.location.href = "dashboard.html"
  }
})

const DOM_access_methods = {
  flag: function(element_id) {

    const error_color = "#C62828";

    if (document.getElementById(element_id)) {
      document.getElementById(element_id).style.borderColor = error_color;
    }
  },
  normalize: function(element_id) {

    const normal_color = "lightgray";

    //Go through all IDs
    element_id.map(function(indice) {
      if (indice) {
        document.getElementById(indice).style.borderColor = normal_color;
        if (document.getElementById(indice)._tippy) {
          document.getElementById(indice)._tippy.destroy();
        }
      }
    })

  },
  handleError: function(element_id, message) {
    try {
      document.getElementById(element_id).title = message;
      var target = document.getElementById(element_id);
      tippy(target, {
        placement: "right",
        arrow: true,
        theme: "error",
        hideOnClick: false,
        setHideOnLeave: false,
        size: "large",
        duration: [undefined, 0]
      });
      DOM_access_methods.flag(element_id);
      target._tippy.show(0);
    } catch (e) {}
  }
}

var auth_method_changer_toNew = document.getElementById("main-returning-dialog__changeAuthMethod");
var auth_method_changer_toReturning = document.getElementById("main-new-dialog__changeAuthMethod");
var main_returning_dialog = document.getElementById("main-returning-dialog");
var main_new_dialog = document.getElementById("main-new-dialog");


//Sets an event so people can switch from LOG IN to SIGN UP
auth_method_changer_toNew.addEventListener("click", function() {
  document.title = "Sign Up · Olog"
  DOM_access_methods.normalize(["main-returning-dialog__email", "main-returning-dialog__password"]);

  if (main_returning_dialog && main_new_dialog) {
    main_returning_dialog.style.display = "none";
    main_new_dialog.style.display = "block";
  }
})

//Sets an event so people can switch from SIGN UP to LOG IN
auth_method_changer_toReturning.addEventListener("click", function() {
  document.title = "Log In · Olog"
  DOM_access_methods.normalize(["main-new-dialog__firstName", "main-new-dialog__lastName", "main-new-dialog__email", "main-new-dialog__password", "main-new-dialog__confirmPassword"]);

  if (main_returning_dialog && main_new_dialog) {
    main_returning_dialog.style.display = "block";
    main_new_dialog.style.display = "none";
  }
})

//Elaborates what will happen when a user clicks the SIGN UP button
document.getElementById("main-new-dialog__register").addEventListener("click", function() {
  DOM_access_methods.normalize(["main-new-dialog__firstName", "main-new-dialog__lastName", "main-new-dialog__email", "main-new-dialog__password", "main-new-dialog__confirmPassword"]);

  var email;
  var password;
  try {
    if (document.getElementById("main-new-dialog__firstName").value.length <= 0) {
      throw (new Error("main-new-dialog__firstName %#% No first name? Kinda shady..."))
    }
    if (document.getElementById("main-new-dialog__lastName").value.length <= 0) {
      throw (new Error("main-new-dialog__lastName %#% Where's your last name at?"));
    }

    firebase.auth().createUserWithEmailAndPassword((function() {
      if ((/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/).test(document.getElementById("main-new-dialog__email").value) === true) {
        return document.getElementById("main-new-dialog__email").value;
      } else {
        throw (new Error("main-new-dialog__email %#% " + (function() {
          if (document.getElementById("main-new-dialog__email").value.length <= 0) {
            return "No email appears to be entered. Spooky."
          } else {
            return "Hmm, this does not seem to be in an email format."
          }
        })()))
      }
    })(), (function() {
      if (document.getElementById("main-new-dialog__password").value.length >= 6) {
        if (document.getElementById("main-new-dialog__password").value === document.getElementById("main-new-dialog__confirmPassword").value) {
          return document.getElementById("main-new-dialog__password").value;
        } else {
          throw (new Error("main-new-dialog__confirmPassword %#% " + (function() {
            if (document.getElementById("main-new-dialog__confirmPassword").value.length === 0) {
              return "404: Password confirmation not found :("
            }
            return "Passwords apparently do not match up.";
          })()));
        }

      } else {
        throw (new Error("main-new-dialog__password %#% Password has to be more than 6 characters."))
      }
    })()).then(function() {
      try {
        firebase.database().ref("members/" + firebase.auth().currentUser.uid).set({
          firstname: document.getElementById("main-new-dialog__firstName").value,
          lastname: document.getElementById("main-new-dialog__lastName").value,
          email: {
            address: document.getElementById("main-new-dialog__email").value,
            verified: false
          },
          accountPhoto: ""
        }).then(function() {
          window.location.href = "dashboard.html"
        }).catch(function(error) {
          DOM_access_methods.handleError(error.message.split(" %#% ")[0], error.message.split(" %#% ")[1]);
        })
      } catch (error) {
        DOM_access_methods.handleError(error.message.split(" %#% ")[0], error.message.split(" %#% ")[1]);
      }
    })
  } catch (error) {
    DOM_access_methods.handleError(error.message.split(" %#% ")[0], error.message.split(" %#% ")[1]);
  }
})

//Denotes what will happen when a user clicks the LOG IN button
document.getElementById("main-returning-dialog__login").addEventListener("click", function() {

  DOM_access_methods.normalize(["main-returning-dialog__email", "main-returning-dialog__password"]);

  var email;
  var password;
  try {
    firebase.auth().signInWithEmailAndPassword((function() {
      if ((/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/).test(document.getElementById("main-returning-dialog__email").value) === true) {
        return document.getElementById("main-returning-dialog__email").value;
      } else {
        throw (new Error("main-returning-dialog__email %#% " + (function() {
          if (document.getElementById("main-returning-dialog__email").value.length <= 0) {
            return "You kind of need an email to sign in...";
          }
          return "That \"email\" does not really look like an email.";
        })()))
      }
    })(), (function() {
      if (document.getElementById("main-returning-dialog__password").value.length > 0) {
        return document.getElementById("main-returning-dialog__password").value;
      } else {
        throw (new Error("main-returning-dialog__password %#% One cannot just login without a password"))
      }
    })()).then(function() {
      window.location.href = "dashboard.html";
    }).catch(function(error) {
      DOM_access_methods.handleError(error.message.split(" %#% ")[0], error.message.split(" %#% ")[1]);
    });
  } catch (error) {
    DOM_access_methods.handleError(error.message.split(" %#% ")[0], error.message.split(" %#% ")[1]);
  }
})