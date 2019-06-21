import { ChatManager, TokenProvider } from "@pusher/chatkit-client";

function handleInput(event) {
  const { value, name } = event.target;

  this.setState({
    [name]: value
  });
}

function connectToChatkit(event) {
  event.preventDefault();
  const { userId } = this.state;

  const tokenProvider = new TokenProvider({
    url:
    "<chatkit test token endpoint>"
  });

  const chatManager = new ChatManager({
    instanceLocator: "<chatkit instance locator>",
    userId,
    tokenProvider
  });

  return chatManager
    .connect({
      onRoomUpdated: room => {
        const { rooms } = this.state;
        const index = rooms.findIndex(r => r.id === room.id);
        rooms[index] = room;
        this.setState({
          rooms,
        });
      }
    })
    .then(currentUser => {
      this.setState(
        {
          currentUser,
        },
        () => connectToRoom.call(this)
      );
    })
    .catch(console.error);
}

function connectToRoom(roomId = "<chatkit room id>") {
  const { currentUser } = this.state;
  this.setState({
    messages: []
  });

  return currentUser
    .subscribeToRoomMultipart({
      roomId,
      messageLimit: 10,
      hooks: {
        onMessage: message => {
          this.setState({
            messages: [...this.state.messages, message],
          });

          const { currentRoom } = this.state;

          if (currentRoom === null) return;

          return currentUser.setReadCursor({
            roomId: currentRoom.id,
            position: message.id,
          });
        },
      }
    })
    .then(currentRoom => {
      this.setState({
        currentRoom,
        rooms: currentUser.rooms,
      });
    })
    .catch(console.error);
}

function sendMessage(event) {
  event.preventDefault();
  const { newMessage, currentUser, currentRoom } = this.state;
  const parts = [];

  if (newMessage.trim() === "") return;

  parts.push({
    type: "text/plain",
    content: newMessage
  });

  currentUser.sendMultipartMessage({
    roomId: `${currentRoom.id}`,
    parts
  });

  this.setState({
    newMessage: "",
  });
}

export {
  handleInput,
  connectToRoom,
  connectToChatkit,
  sendMessage,
}
