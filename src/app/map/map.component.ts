import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { loadModules } from 'esri-loader';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as d3 from 'd3';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  @Output() selectedFeature = new EventEmitter();

  @ViewChild('mapNode') private mapNodeElementRef: ElementRef;
  @ViewChild('legendNode') private legendNodeElementRef: ElementRef;
  @ViewChild('content') private contentElementRef: ElementRef;

  public stateName: string;
  public pop2000: string;
  public femaleNum: number;
  public maleNum: number; 
  public sumGender: number;
  public femalePercent: number;
  public malePercent: number;  

  public width = 300
  public height = 300
  public margin = 60
  public radius ;
  public svg;
  public color;
  public pie;
  public data_ready;
  public data = { };
  constructor(private modalService: NgbModal) { }

  ngAfterViewInit() {
    const options = { version: '3.28', css: true };

    loadModules([
      'esri/map',
      'esri/layers/ArcGISDynamicMapServiceLayer',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/Color',
      'esri/tasks/query',
      'esri/tasks/QueryTask',
      'esri/dijit/Legend'
    ], options)
      .then(([
        Map,
        ArcGISDynamicMapServiceLayer,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        Query,
        QueryTask,
        Legend
      ]) => {
        const map = new Map(this.mapNodeElementRef.nativeElement, {
          center: [-96, 39],
          zoom: 4,
          basemap: 'gray'
        });

        const layer = new ArcGISDynamicMapServiceLayer('https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer', {});
        layer.setVisibleLayers([3]);

        map.addLayer(layer);

        const legend = new Legend({
          map
        }, this.legendNodeElementRef.nativeElement);
        legend.startup();

        map.on('click', event => {
          const query = new Query();
          query.outFields = ['*'];
          query.returnGeometry = true;
          query.geometry = event.mapPoint;

          const queryTask = new QueryTask('https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3');
          queryTask.execute(query, featureSet => {
            if (featureSet.features[0]) {
              map.graphics.clear();
              const feature = featureSet.features[0];

              const mySymbol = new SimpleFillSymbol('none',
                new SimpleLineSymbol('solid', new Color([255, 0, 0]), 2.5), new Color([0, 0, 0, 0.25])
              );

              feature.setSymbol(mySymbol);
              map.graphics.add(feature);

              this.stateName = feature.attributes.STATE_NAME;
              this.pop2000 = feature.attributes.POP2000;

              this.femaleNum = feature.attributes.FEMALES;
              this.maleNum = feature.attributes.MALES;
              // d3.selectAll('.genderNum li')
              //   .data([this.femaleNum, this.maleNum])
              //   .style({"background-color":"blue", "padding":"5px"})
              this.sumGender = this.femaleNum + this.maleNum;
              this.femalePercent = ((this.femaleNum / this.sumGender) * 100);
              this.malePercent = ((this.maleNum / this.sumGender) * 100);    
              // d3.select('.femaleNum') 
              //   //.data([30])
              //   .style("background-color","#0eede9")
              //   .style("width",+this.femalePercent+"%") //this.femalePercent

              // d3.select('.maleNum') 
              //   //.data([70])
              //   .style("background-color","#11fc92")
              //   .style("width",+this.malePercent+"%") //this.malePercent

              //donut
              this.data = { a: Math.round(this.femalePercent), b: Math.round(this.malePercent)}
              this.radius = Math.min(this.width, this.height) / 2 - this.margin

              this.svg = d3.select(".donutChart")
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

              // set the color scale
              this.color = d3.scaleOrdinal()
                .domain(Object.keys(this.data))
                .range(["#0eede9", "#11fc92"]);

              // Compute the position of each group on the pie:
              this.pie = d3.pie()
                .value(function (d) { return d.value })

              this.data_ready = this.pie(d3.entries(this.data))

              this.svg
                .selectAll('whatever')
                .data(this.data_ready)
                .enter()
                .append('path')
                .attr('d', d3.arc()
                  .innerRadius(130)         // This is the size of the donut hole
                  .outerRadius(this.radius))
                .attr('fill',(d) => { return (this.color(d.data.key)) })
                .attr("stroke", "white")
                .style("stroke-width", "1px")
                
                
              this.svg.append("text")
                .attr("text-anchor", "middle")
                .text(Math.round(this.femalePercent)+"%")  


              this.modalService.open(this.contentElementRef);
              this.selectedFeature.emit(feature);
            }
          });
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
}
