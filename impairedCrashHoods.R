library(plyr)
library(jsonlite)
library(rgdal)


setwd("C:/Users/admin/WebstormProjects/VisionZeroImpairedCrashes")

#read in CSV file
crashes <- read.csv(file="crash_list_hood.csv",header=TRUE,sep=",")

#remove all non impaired crashes
impairedCrashes<-subset(crashes, impairment!="N/A")

#fix time variables
impairedCrashes$reportdate<-strptime(impairedCrashes$reportdate,"%d-%b-%y")

#setup time constants for date filters
x2010 = strptime("2010-01-01 00:00:00","%Y-%m-%d %H:%M:%S")
x2011 = strptime("2011-01-01 00:00:00","%Y-%m-%d %H:%M:%S")
x2012 = strptime("2012-01-01 00:00:00","%Y-%m-%d %H:%M:%S")
x2013 = strptime("2013-01-01 00:00:00","%Y-%m-%d %H:%M:%S")
x2014 = strptime("2014-01-01 00:00:00","%Y-%m-%d %H:%M:%S")
x2015 = strptime("2015-01-01 00:00:00","%Y-%m-%d %H:%M:%S")

#seperate out each year of data 
#TODO: Determine if this is optimal method for seperation. Arrays? Objects? Lists? 
impairedCrashes2010 <- subset(impairedCrashes, reportdate>x2010 &reportdate<x2011)
impairedCrashes2011 <- subset(impairedCrashes, reportdate>x2011 &reportdate<x2012)
impairedCrashes2012 <- subset(impairedCrashes, reportdate>x2012 &reportdate<x2013)
impairedCrashes2013 <- subset(impairedCrashes, reportdate>x2013 &reportdate<x2014)
impairedCrashes2014 <- subset(impairedCrashes, reportdate>x2014 &reportdate<x2015)

#get the unique neighborhoods for impaired crashes by year
impairedHoodCounts2010 <-count(impairedCrashes2010$neighborhood_name)
impairedHoodCounts2011 <- count(impairedCrashes2011$neighborhood_name)
impairedHoodCounts2012 <-count(impairedCrashes2012$neighborhood_name)
impairedHoodCounts2013 <-count(impairedCrashes2013$neighborhood_name)
impairedHoodCounts2014 <-count(impairedCrashes2014$neighborhood_name)


#merge data to create roll up of neighborhood counts on a yearly basis
#TODO: Determine if this "multi step merge" is the most efficent way to merge across N variables
mergedHoods20102011 <- merge(x = impairedHoodCounts2010 , y = impairedHoodCounts2011, by = "x", all = TRUE)
mergedHoods201020112012 <- merge(x = mergedHoods20102011 , y = impairedHoodCounts2012 , by = "x", all = TRUE)
mergedHoods2010201120122013 <- merge(x = mergedHoods201020112012 , y = impairedHoodCounts2013 , by = "x", all = TRUE)
mergedHoodsAll <- merge(x = mergedHoods2010201120122013 , y = impairedHoodCounts2014 , by = "x", all = TRUE)

#reset column names for easy reading and calculation
colnames(mergedHoodsAll)<-c("name","2010","2011","2012","2013","2014");

#total the incidents across all years per neighborhood
mergedHoodsAll$total <- rowSums(mergedHoodsAll[,c('2010', '2011', '2012','2013','2014')], na.rm=TRUE)


annualTotals<- colSums(mergedHoodsAll[,c('2010', '2011', '2012','2013','2014')], na.rm=TRUE)

print(annualTotals);


#convert dataset to JSON
toJSON(mergedHoodsAll)

#get DC GIS Neighborhoods 
hoodBoundries <- readOGR("neighborhood_names.geojson", "OGRGeoJSON")

#merge impaired driving incidents with the GeoJSON on a per neigbhorhood basis 
hoodBoundries <- merge(hoodBoundries,mergedHoodsAll)


#write out final compiled GeoJSON
writeOGR(hoodBoundries,"annotatedData.geojson","Neighborhoods",driver="GeoJSON");
