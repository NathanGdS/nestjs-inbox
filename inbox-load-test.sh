#!/bin/bash
# Teste de carga na rota /inbox usando autocannon

npx autocannon -c 20 -d 10 -p 10 -m POST \
  -H "Content-Type: application/json" \
  -b '{
    "type": "order_created",
    "payload": {"customerName": "Alice", "product": "Book"}
  }' \
  http://localhost:3000/inbox &

npx autocannon -c 20 -d 10 -p 10 -m POST \
  -H "Content-Type: application/json" \
  -b '{
    "type": "order_created",
    "payload": {"customerName": "Jhon", "product": "Book"}
  }' \
  http://localhost:3000/inbox &


npx autocannon -c 20 -d 10 -p 10 -m POST \
  -H "Content-Type: application/json" \
  -b '{
    "type": "order_created",
    "payload": {"customerName": "Karen", "product": "Book"}
  }' \
  http://localhost:3000/inbox &

wait
