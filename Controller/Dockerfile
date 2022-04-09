FROM python:3.7-alpine3.14

COPY . .

EXPOSE 4040

#Uncomment below command to run the test case.
# ENTRYPOINT ["python", "-u", "convert_follower_node1.py"]

ENTRYPOINT ["sh", "./start.sh" ]
