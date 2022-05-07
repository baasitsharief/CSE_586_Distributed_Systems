import json
import socket
import traceback
import time

# Wait following seconds below sending the controller request

# Read Message Template
msg = json.load(open("Message.json"))

# Initialize
sender = "Controller"
target = "Node4"
port = 4040

# Request
msg['sender_name'] = sender
msg['request'] = "TIMEOUT"
print(f"Request Created : {msg}")

# Socket Creation and Binding
skt = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
skt.bind((sender, port))

# Send Message
try:
    # Encoding and sending the message
    skt.sendto(json.dumps(msg).encode('utf-8'), (target, port))
except:
    #  socket.gaierror: [Errno -3] would be thrown if target IP container does not exist or exits, write your listener
    print(f"ERROR WHILE SENDING REQUEST ACROSS : {traceback.format_exc()}")

