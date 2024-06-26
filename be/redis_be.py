from flask import Flask, flash, request, jsonify, render_template, redirect, url_for, g, session, send_from_directory, abort
from flask_cors import CORS

#from flask_api import status
import http

#from redis import Redis
from rejson import Client, Path

from datetime import date, datetime, timedelta
from calendar import monthrange
# pip install -U python-dateutil pytz tzlocal
from dateutil.parser import parse
import pytz
import os
import sys
import time
import uuid
import json
import random
import array
import string
import pathlib
import io
from uuid import UUID
from bson.objectid import ObjectId

import random

# start redis:rejson server instead
# https://redislabs.com/blog/redis-as-a-json-store/
# https://dzone.com/articles/redis-as-a-json-store
# docker run -d -p 6379:6379 --name redis-redisjson redislabs/rejson:latest
#rj = Client(host='localhost', port=6379, decode_responses=True)
# rj = Client(host='192.168.99.100', port=6379, decode_responses=True)

rj = Client(host='redis', port=6379, decode_responses=True)

push_to_redis = True
rj_host = 'localhost'

# Hard-coded time zone. Required for correct ObjectId comparisons!
local_zone = pytz.timezone('US/Eastern')

app = Flask(__name__)
CORS(app)
basedir = os.path.abspath(os.path.dirname(__file__))

prefixes = ('fg', 'ug', 'sg', 'bu', 'us', 
            'ag', 'ac', 'cb', 'tw', 'jo', 'so', 'pl',
            'sm', 'sp', 'ft', 'ut')

cnames = ('fleetgroups', 'usergroups', 'sortiegroups', 'fleet', 'users', 
            'agents', 'activity',  'club', 'tweets', 'jobs', 'sorties', 'plans')


def tryexcept(requesto, key, default):
    lhs = None
    try:
        lhs = requesto.json[key]
        # except Exception as e:
    except:
        lhs = default
    return lhs

def prefix_crud_timestamp_suffix(key):
    prefix = key[:3]
    crud = key[3:4]
    #hyphens = [i for i in range(len(key[:4])) if key[:4].startswith('-'', i)]
    hyphen1 = key.find('-')
    hyphen2 = key[5:].find('-')
    timestamp = key[hyphen1+1:hyphen1+1+hyphen2]
    suffix = key[hyphen1+hyphen2+2:]
    return prefix, crud, timestamp, suffix #coll, op, time, guid

def timestamp_prefix_crud_suffix(key):
    print("key: ", key)
    hyphen1 = key.find('-')
    timestamp = key[:hyphen1]
    prefix = key[hyphen1+1:hyphen1+4]
    crud = key[hyphen1+5:hyphen1+6]
    suffix = key[hyphen1+7:]
    print("timestamp, prefix, crud, suffix: ", timestamp, prefix, crud, suffix)
    return timestamp, prefix, crud, suffix #time, coll, op, guid

## seconds since midnight
def ssm():
    now = datetime.now()
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return str((now - midnight).seconds)


# wrap adding to redisjson queue 
# rj.jsonset('fagu-' + ssm() + '-' + str(id), Path.rootPath(), agents[id])
# This function needs to be *fast*. 
def rjjsonsetwrapper(key, path, r):
    #import pdb; pdb.set_trace()
	# get collection and crud from key
    prefix, crud, timestamp, suffix = prefix_crud_timestamp_suffix(key)
    print("prefix, crud, timestamp, suffix: ", prefix, crud, timestamp, suffix)
    print(key, path, r)
		
    try:
        # PLAN A: save to redis
        rj.jsonset(key, path, r)
        return True

    except Exception as e:
        #logging.error(e)
        print('rjjsonsetwrapper() error:', str(e))
        print("*** redis is dead!")
        start_time = datetime.now()

        return False
        

# documentation
@app.route("/")
def home(): 
    if rj_host == 'localhost':
        return """twtr backend endpoints:<br />
            <br />
            From collections:<br/>
            /enqueue-get<br />
            /collections-from-redis-cache<br />
			/purge-redis-cache"""
    else:
        return """Remote mock:<br />
            <br />
            From collections:<br/>
            /users<br />
            /collections-from-redis-cache<br />
			/purge-redis-cache"""


# returns all items from redis
@app.route('/collections-from-redis-cache')
def collections_from_redis_cache():
    data = dict()
    try:
        for key in rj.keys('*'):
            #keys.append(key)
            #data.append(rj.jsonget(key, Path.rootPath()))
            #print('data: ', data)
            data[key] = rj.jsonget(key, Path.rootPath())
            #rj.delete(key)
    except:
        print("*** redisjson is dead!")
        #data['oopsie'] = "queue unaccessible"
        # https://www.flaskapi.org/api-guide/status-codes/
        return jsonify({"Queue inaccessible.": http.HTTPStatus.INTERNAL_SERVER_ERROR})
    #print()
    #output = []
    #for k,v in zip(keys, data):
    #    output.append(data)
    #return jsonify({'result' : output})
    return jsonify(data)


@app.route('/purge-redis-cache')
def purge_redis_cache():
    data = dict()
    try:
        for key in rj.keys('*'):
            data[key] = rj.jsonget(key, Path.rootPath())
            rj.delete(key)
    except:
        print("*** purge_redis_cache(): redisjson is dead!")
    return jsonify(data)


@app.route("/enqueue", methods=["POST"])
def enqueue():

	#prefix = tryexcept(request, 'prefix', None)
	#id = tryexcept(request, 'id', None)
	key = tryexcept(request, 'key', None)
	path = tryexcept(request, 'path', None)
	record = tryexcept(request, 'record', None)
	#print("data:", prefix, id, record)

	# prefix = 'augi-', id = group['_id']
	if push_to_redis:
		# testing:
		#rjjsonsetwrapper(prefix + ssm() + '-' + str(id), Path.rootPath(), record)
		if rjjsonsetwrapper(key, path, record):
			print("Enqueued.")
			return jsonify("Enqueued.", http.HTTPStatus.OK)
		else:
			print("Not enqueued!")
			return jsonify("Not enqueued.", http.HTTPStatus.INTERNAL_SERVER_ERROR)
	else:
		print("Dropped.")
		return jsonify("Dropped.", http.HTTPStatus.OK)
		

@app.route("/enqueue-get", methods=["GET"])
def enqueue_get():

	#prefix = tryexcept(request, 'prefix', None)
	#id = tryexcept(request, 'id', None)
	#key = str(uuid.uuid1())
	key = str(random.randint(1000000000, 2000000000))
	path = "."
	record = "no_mr_bond_I want_you_to_die"
	#print("data:", prefix, id, record)

	# prefix = 'augi-', id = group['_id']
	if push_to_redis:
		# testing:
		#rjjsonsetwrapper(prefix + ssm() + '-' + str(id), Path.rootPath(), record)
		rjjsonsetwrapper(key, path, record)
		print("Enqueued.")
		return jsonify("Enqueued.", http.HTTPStatus.OK)
	else:
		print("Dropped.")
		return jsonify("Dropped.", http.HTTPStatus.OK)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3232, debug=True)