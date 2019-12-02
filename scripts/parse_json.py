import urllib, json, qgis
from PyQt5.QtCore import *
from qgis.core import *
from urllib.request import urlopen

point_layer = QgsVectorLayer("PointString?crs=epsg:4326&index=yes", "point_data", "memory")
point_layer.startEditing()

point_layer.dataProvider().addAttributes([QgsField("id_precinct", QVariant.Int),
                    QgsField("precinct_name",  QVariant.String),
                    QgsField("siruta", QVariant.String)])
point_layer.updateFields()

url = 'https://prezenta.bec.ro/prezidentiale24112019/data/presence/json/presence_AB_now.json?_=1575182323888'
with urlopen(url) as response:
    data = json.loads(response.read())

features=[]

for point in data['precinct']:
    if point['latitude'] != NULL:
        feat = QgsFeature()
        point_geometry_string = QgsPointXY(float(point['latitude']), float(point['longitude']))
        point_geometry = QgsGeometry.fromPointXY(point_geometry_string)
        feat.setGeometry(point_geometry)
        feat.setAttributes([int(point["id_precinct"]), point["precinct_name"], point["siruta"]])
        features.append(feat)

point_layer.dataProvider().addFeatures(features)
point_layer.commitChanges()

point_layer.updateExtents()
point_layer.updateFields() 

QgsProject.instance().addMapLayer(point_layer)