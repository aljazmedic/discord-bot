import sys
import random
import argparse


parser = argparse.ArgumentParser()
parser.add_argument('n', type=int)
source = parser.add_mutually_exclusive_group(required=True)
source.add_argument('-f', type=argparse.FileType('r'))
source.add_argument('-p', type=str, nargs='+')

parsed = parser.parse_args()

players = []
if parsed.f is not None:
	players = [x[:-1] for x in parsed.f.readlines()]
	print(players)
	parsed.f.close()
else:
	players = parsed.p 

random.shuffle(players)
n = parsed.n


skip_n = int(len(players)/n)

teams = []
for i in range(0, len(players), n):
	teams.append(players[i:i+n])

for i, t in enumerate(teams, start=1):
	print(f"Team {i}:")
	print(*t, '',sep="\n")