const benchmarkSelect=document.querySelector('#benchmark-select');
const benchmarkMetric=document.querySelector('#benchmark-metric');
function renderBenchmark(){
 const selected=benchmarkSelect.value;
 document.querySelector('#benchmark-metric-control').hidden=selected!=='seven';
 let headers,rows,description,note;
 const scenes=['Chess','Fire','Heads','Office','Pumpkin','Kitchen','Stairs','Average'];
 if(selected==='seven'){
  const completeness=benchmarkMetric.value==='completeness';
  headers=['Method',...scenes];
  rows=publicBenchmarks.seven.map(r=>[r[0],...r.slice(1).filter((_,i)=>i%2===(completeness?1:0))]);
  description=`7-Scenes reconstruction · ${completeness?'Completeness':'Accuracy'} error in centimeters (↓). Per-scene results and the reported Average column.`;
  note='AWM-3DFM has the lowest reported average accuracy error (1.97 cm) and completeness error (1.75 cm) among the listed methods. Individual-scene rankings vary.';
 }else if(selected==='tum'){
  headers=['Method','Calibration','360','Desk','Desk2','Floor','Plant','Room','RPY','Teddy','XYZ','Average'];
  rows=publicBenchmarks.tum.map((r,i)=>[r[0],i<8?'Calibrated':'Uncalibrated',...r.slice(1)]);
  description='TUM RGB-D localization · ATE RMSE in meters (↓). Calibrated and uncalibrated settings are identified separately.';
  note='AWM-3DFM has the lowest reported average error among the listed uncalibrated methods (0.042 m). Calibrated methods are included for context. X and – are retained as reported in the manuscript; they are not zero errors.';
 }else{
  headers=['Method','Room 0','Room 1','Room 2','Office 0','Office 1','Office 2','Office 3','Office 4','Average'];
  rows=publicBenchmarks.replica;
  description='Replica localization · ATE RMSE in centimeters (↓). Results for eight scenes and the reported Average column.';
  note='AWM-3DFM has the lowest reported average among the methods included in the manuscript’s ranking (3.05 cm). GO-SLAM, DIM-SLAM and DROID-SLAM variants are conventional reference methods, excluded from that ranking. * denotes uncalibrated evaluation; gt int denotes ground-truth intrinsics. – denotes an unreported value.';
 }
 const target=document.querySelector('#benchmark-table');
 target.innerHTML=table(headers,rows);
 if(selected==='replica')target.querySelectorAll('tbody tr').forEach((row,i)=>{if(i>=3&&i<=6){row.classList.add('reference-method');row.querySelector('th').append(' (reference)');}});
 target.scrollLeft=0;
 document.querySelector('#benchmark-description').textContent=description;
 document.querySelector('#benchmark-note').textContent=note;
}
benchmarkSelect.addEventListener('change',renderBenchmark);
benchmarkMetric.addEventListener('change',renderBenchmark);
renderBenchmark();
