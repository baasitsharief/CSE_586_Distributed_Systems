#!/bin/sh

python -u "convert_follower_node1.py"
python -u "timeout_node1.py"
python -u "leader_info_node1.py"
python -u "shutdown_node1.py"