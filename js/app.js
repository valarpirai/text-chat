// UI Manager for the Chat app
function myjsapp(peerClient) {
    var chatHistory = {};
    var chatPanel = {};

    var cookie = {
        // Read cookie
        get: function getCookie(name) {
            var cookies = {};
            var c = document.cookie.split('; ');
            for (i = c.length - 1; i >= 0; i--) {
                var C = c[i].split('=');
                cookies[C[0]] = C[1];
            }
            return cookies[name] || null;
        },

        // create cookie
        set: function createCookie(name, value, minutes) {
            if (minutes) {
                var date = new Date();
                date.setTime(date.getTime() + (minutes * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            } else
                var expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
        },

        remove: function deleteCookie(name) {
            var date = new Date();
            date.setTime(date.getTime() - 60 * 1000);
            document.cookie = name + "=; expires=" + date.toGMTString() + "; path=/";
        }
    };

    function EventListeners() {
        $('#peer-id').tooltip()

        function connectToPeer(id) {
            id = id.trim();
            if (id) {
                peerClient.connectToId(id.toLowerCase())
            }

            $('.chat-div').addClass('hide');
            $('.' + id).removeClass('hide');
        }

        $(document).on('click', '.peeruser', function() {
            var id = $(this).text()
            connectToPeer(id)
        });

        Element.prototype.remove = function() {
            this.parentElement.removeChild(this);
        }

        $('#peer-id').click(function(event) {
            var textArea = document.createElement("textarea");
            // Avoid flash of white box if rendered for any reason.
            textArea.style.background = 'transparent';
            textArea.value = $(this).text();
            document.body.appendChild(textArea);
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
                textArea.remove();
            } catch (err) {
                console.log('Oops, unable to copy');
            }
        });

        $('#user-name').keypress(function(event) {
            if (13 == event.which) {
                var username = $('#user-name').val().trim();
                $('#getUserNameModal').modal('hide')
                if (cookie.get('username') != username)
                    startPeerClient(username)
            }
        })

        $('.username-done').click(function(event) {
            var username = $('#user-name').val().trim();
            if (cookie.get('username') != username)
                startPeerClient(username)
        })
    }

    function appendToHistory(id, message, isSent) {
        if (chatHistory[id]) {
            var hist = chatHistory[id];
            var fromTxt = isSent ? 'You' : id
            var msg = $('<li><b>' + fromTxt + ': </b> </li>').append('<span>' + message + '</span')
            hist.append(msg)
                .scrollTop(hist[0].scrollHeight);
        }
    }

    function startPeerClient(username) {
        // TODO - Set title
        cookie.set('username', username);
        peerClient.connectToServerWithId(username);
    }

    // Show Username Modal
    var username = cookie.get('username');
    if (username) {
        $('#user-name').val(username)
        startPeerClient(username)
    } else {
        $('#getUserNameModal').modal('show')
    }

    EventListeners();

    return {
        setPeerId: function(id) {
            $('#peer-id').text(id);
        },

        createChatWindow: function(id) {
            var toPeerId = id;
            var panel = $('<div class="chat-div ' + id + '"><div class="panel-heading"></div>' +
                '<div class="panel-body"></div><div class="panel-footer">' +
                '<div class=""><div class="form-group">' +
                '</div></div></div></div>')

            var title = $('<span class="panel-title"></span>').text(toPeerId)
            var history = $('<ul class="chatHistory"></ul>')
            var message = $('<input type="text" class="text-msg form-control mr-3" placeholder="Enter Message">')
            var sendBtn = $('<button type="button" class="btn btn-outline-primary">Send</button>')

            chatHistory[toPeerId] = history
            chatPanel[toPeerId] = panel

            $('.panel-heading', panel).append(title)
            $('.panel-body', panel).append('<span class="text-primary">You can now start chatting</span>').append(history)
            $('.form-group', panel).append(message).append(sendBtn)

            $('.chat-container').append(panel);

            $('.panel-heading', panel).click(function() {
                var panelBody = $(".panel-body, .panel-footer", $(this).parent());
                if (panelBody.hasClass("hide")) {
                    panelBody.removeClass("hide")
                    panel.removeClass('min')
                } else {
                    panel.addClass('min')
                    panelBody.addClass("hide")
                }
            })

            message.keypress(function(event) {
                if (13 == event.which) {
                    var msgText = $(this).val().trim()
                    if (msgText) {
                        peerClient.sendMessage(toPeerId, msgText)
                        appendToHistory(toPeerId, msgText, true)
                        $(this).val('')
                    }
                }
            });

            sendBtn.click(function(event) {
                var msgText = message.val().trim()
                if (msgText) {
                    peerClient.sendMessage(toPeerId, msgText)
                    appendToHistory(toPeerId, msgText, true)
                    message.val('').focus()
                }
            });
        },

        appendHistory: appendToHistory,

        closeChatWindow: function(id) {
            if (chatPanel[id]) {
                chatPanel[id].remove()
                delete chatPanel[id]
                delete chatHistory[id]
            }
        },
        showError: function(msg) {

        },
        updateOnlieUsers: function(users) {
            var list = $('.onlinepeers')
            list.empty()
            if (users.length == 0) {
                var usr = '<li>Looks like no one is online</li>'
                list.append(usr);
                return
            }
            for (var i = 0; i < users.length; i++) {
                var usr = '<li class="peeruser">' + users[i] + '</li>'
                list.append(usr);
            }
        }
    };
}

var myapp, peerapp;

$(document).ready(function() {
    myapp = myjsapp(peerapp);
});