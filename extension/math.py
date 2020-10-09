

num = 35
for i in range(0, num + 1):
    for j in range(0, num + 1):
        if((i * j) % num == 1):
            print(i, j)