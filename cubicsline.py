import matplotlib.pyplot as plt
import numpy as np
from scipy.interpolate import CubicSpline
#Plotting



cpu = []
f = open("logCPU.txt", "r")
cpu = f.split(" ")
f.close()

ram = []
f = open("logRAM.txt", "r")
ram = f.split(" ")
f.close()


xcpu = []
for i in range(len(cpu)):
    xcpu.append(i/2)

xram = []
for i in range(len(ram)):
    xram.append(i/2)


cpu = plt.figure('y(x)',figsize=(12,3))
plt.plot(xcpu,cpu, '*')
plt.title('CPU bruk')
plt.xlabel('$tid$ (s)',fontsize=20)
plt.ylabel('$Ghz$',fontsize=20)
plt.ylim(0,0.350)
plt.grid()
plt.show()

ram = plt.figure('y(x)',figsize=(12,3))
plt.plot(xram,ram, '*')
plt.title('RAM bruk')
plt.xlabel('$tid$ (s)',fontsize=20)
plt.ylabel('$ram$ (kb)',fontsize=20)
plt.ylim(0,0.350)
plt.grid()
plt.show()
