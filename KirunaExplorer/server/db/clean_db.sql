-- SQLite
DROP TABLE IF EXISTS Attachments;
DROP TABLE IF EXISTS Connections;
DROP TABLE IF EXISTS Geolocation;
DROP TABLE IF EXISTS Documents;
DROP TABLE IF EXISTS Geolocation_Documents;
DROP TABLE IF EXISTS OriginalResources;

CREATE TABLE "Geolocation" (
	"area_id"	INTEGER NOT NULL,
	"long"	REAL NOT NULL,
	"lat"	REAL NOT NULL,
	"area_name"	TEXT NOT NULL DEFAULT ' '
);

CREATE TABLE "Attachments" (
	"file_name" VARCHAR(255),
	"document_id" INTEGER NOT NULL,
	PRIMARY KEY("file_name", "document_id"),
	FOREIGN KEY("document_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "Connections" (
	"parent_id" INTEGER,
	"children_id" INTEGER,
	"connection_type" VARCHAR(50),
	PRIMARY KEY("parent_id", "children_id"),
	FOREIGN KEY("parent_id") REFERENCES "Nodes"("node_id"),
	FOREIGN KEY("children_id") REFERENCES "Nodes"("node_id"),
	FOREIGN KEY("parent_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE,
	FOREIGN KEY("children_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "Documents" (
	"document_id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"document_title" VARCHAR(255) NOT NULL,
	"stakeholder" VARCHAR(100) NOT NULL,
	"scale" VARCHAR(50) NOT NULL,
	"issuance_date" DATE NOT NULL,
	"language" VARCHAR(50),
	"pages" INT,
	"document_type" VARCHAR(50) NOT NULL,
	"document_description" TEXT NOT NULL
);

CREATE TABLE "Geolocation_Documents" (
	"area_id" INTEGER NOT NULL,
	"document_id" INTEGER NOT NULL,
	PRIMARY KEY("area_id", "document_id"),
	FOREIGN KEY("area_id") REFERENCES "Geolocation"("area_id"),
	FOREIGN KEY("document_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "OriginalResources" (
	"file_name" VARCHAR(255) NOT NULL,
	"document_id" INTEGER NOT NULL,
	PRIMARY KEY("file_name", "document_id"),
	FOREIGN KEY("document_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(0,67.86639 , 20.201883, 'Whole Area');
INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(0,67.867071 , 20.307369, 'Whole Area');
INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(0,67.83225 , 20.199909, 'Whole Area');
INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(0,67.837947, 20.292263, 'Whole Area');


