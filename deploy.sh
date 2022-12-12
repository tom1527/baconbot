#!/bin/sh

# Copy service file, incase if there are any changes
sudo cp porkbot.service /etc/systemd/system/porkbot.service

# reload configurations incase if service file has changed
sudo systemctl daemon-reload
