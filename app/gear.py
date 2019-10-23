import redisgears

def passAll(x):
    redisgears.executeCommand("xadd", "log", "*", "f", "passAll", "enter", x)
        

# creating execution plane
gearsCtx('StreamReader').\
    foreach(passAll).\
    register('temp')

