from netCDF4 import Dataset
import xarray as xr
import pandas as pd 
import matplotlib.pyplot as plt 
import numpy as np

from datetime import datetime, date, timedelta
from lxml import etree
from io import StringIO
import requests
import time
import os
import pathlib

baseurls = ['https://www.ncei.noaa.gov/data/sea-surface-temperature-optimum-interpolation/v2.1/access/avhrr/'] 

def getLinks(url):
    print("Getting links from: " + url)
    page = session.get(url)
    html = page.content.decode("utf-8")
    tree = etree.parse(StringIO(html), parser=etree.HTMLParser())
    refs = tree.xpath("//a")
    print(refs)    
    filteredlist = []
    for link in refs: 
        filteredlist.append(link.get('href', ''))
    return list(filteredlist)

def isDate(l):
    isDate = False
    for fmt,substr in [('%Y.%m.%d',l[0:10]), ('%Y',l[0:4])]:
        try:
            d = datetime.strptime(substr,fmt).date()
            return True
        except ValueError:
            isDate = False
    return False

def isHDFFile(l):
    ext = ['.HDF5', '.H5', '.HDF', '.NC']
    return any([l.lower().endswith(e.lower()) for e in ext])   

for url in baseurls:
    session = requests.Session()
    basedir = pathlib.PurePath(url).name
    print(basedir)
    links = getLinks(url)
    ldates = [l for l in links if isDate(l)]
    print("ldates")
    # Add filter to data here with ldates to avoid downloading all data. 
    print(ldates)
    for d in ldates:
        links_date = getLinks(url + d)
        l_hdf = [l for l in links_date if isHDFFile(l)]
        for f in l_hdf:
            folder = basedir + '/' + d
            filepath = folder + f
            if pathlib.Path(filepath).is_file():
                print ("File exists: " + filepath )
            else:
                print("File doesn't exist: " + filepath )
                print("Downloading... " + url + d + f)
                f = session.get(url + d + f)
                time.sleep(1)
                pathlib.Path(folder).mkdir(parents=True, exist_ok=True)
                open(filepath, 'wb').write(f.content)



data = xr.open_dataset("https://www.ncei.noaa.gov/data/sea-surface-temperature-optimum-interpolation/v2.1/access/avhrr/202312/oisst-avhrr-v02r01.20231201.nc", decode_times=False)
# print(data)
print("The data" )

print("The Data Vars")
print(data.sst)
print("Data values")
noValues = len(data.sst.values.flatten())
print("Number of values")
print(noValues)
i = 8390

# get the mean average sst temperature

sst = data.sst
sstBove = (sst >= 0)
woop = xr.DataArray(data.sst, coords=data.coords, dims=data.dims)
print("WOOPWOOP")
print(woop)
vars=data.data_vars
print(vars)
print("SST")

print(sst)
differentvalue = (sst.lat > -59.00)&(sst.lat < 59.00)
overzero = (sst.values > 0)    
print("overzero")   
print(overzero)  
print("differentvalue")
print(differentvalue)
max = sst.max()
mean = sst.clip(0,100).mean()
lonMean = sst[:,0,differentvalue,:].clip(0,1000).mean()
min = sst.min()


print(max)

print(mean)
print(lonMean)
print(min)

#while i <= 8400:
#    print(data[i].values)
#    i += 1
# rootgrp = Dataset("oisst-avhrr-v02r01.20231128.nc")




# print(rootgrp.groups)
# print(rootgrp.__dict__)
# print(rootgrp.data_model)
#for name in rootgrp.ncattrs():
#    print("Global attr {} = {}".format(name, getattr(rootgrp, name)))
#print(rootgrp.__dict__)
#print(rootgrp.sensor)
#rootgrp.close()