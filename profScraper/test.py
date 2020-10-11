def gcd(a, b):
    while True:
        if b % a == 0:
            break
        if a % b == 0:
            break
        if b > a:
            b = b % a
            print(a, b)
        if a > b:
            a = a % b
            print(a, b)
    print(a, b)
    return [a, b]


gcd(1401, 462)