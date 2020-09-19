import random


def printNum():
    for i in range(100):
        print(i)


def returnNum():
    return 5


printNumValue = printNum()

returnNumValue = returnNum()


print("printNumValue", printNumValue)
print("returnNumValue", returnNumValue)
