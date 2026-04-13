//Developed by Amit Kumar Sah - amitkumars954@gmail.com

(function () { 
    if (!mstrmojo.plugins.VerticalNodeHierarchy) {
        mstrmojo.plugins.VerticalNodeHierarchy = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.CustomVisBase",
        "mstrmojo.models.template.DataInterface",
        "mstrmojo.vi.models.editors.CustomVisEditorModel"
    );
	


    mstrmojo.plugins.VerticalNodeHierarchy.VerticalNodeHierarchy = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.VerticalNodeHierarchy.VerticalNodeHierarchy",
            cssClass: "verticalnodehierarchy",
            errorMessage: "There is either not enough data (i.e min 2 category value) to display the visualization or an error occurred while executing the visualization.",
            errorDetails: "This visualization requires two attributes and one metric.",
            externalLibraries: [{url: (mstrApp.getPluginsRoot && mstrApp.getPluginsRoot() || "../plugins/") +"VerticalNodeHierarchy/lib/jquery.js"},
			{url: (mstrApp.getPluginsRoot && mstrApp.getPluginsRoot() || "../plugins/") +"VerticalNodeHierarchy/lib/VerticalNodeHierarchyd3.v7.min.js"}], //Using V7 of D3 Library
            useRichTooltip: false,
            reuseDOMNode: false,
            supportNEE: true,
            plot:function(){
				
				//debugger;

				var me = this;
				
				if(me.domNode.childNodes.length===1){
					me.domNode.removeChild(me.domNode.childNodes[0]);
				}
				
				var dataConfig = {hasSelection: true};
				me.addUseAsFilterMenuItem();
				me.addAttributeSelection();
				me.addSelectionsFromExpression;
				
				/*
				var indexMap = [], // to store attributeElement - index pair
				barData = [],
				xAxisData =[];
				*/

				//const nodes = [],
				//links =[];
				
				/*
				//Creating Dynamic Bar Static and highlight Color
				const staticColor =   "steelblue",
				highlightColor = "orange";
				
				//Creating Css property 
				var sheet = document.createElement('style')
				sheet.innerHTML = ".bar {fill: "+staticColor+"} .highlight {fill:"+highlightColor+"}";
				document.body.appendChild(sheet);
				*/
				
				//Viz ID
				var gridID = me.domNode.id;
				gridID = gridID.replace(/\*/g, '\\*');
                var gridIDSplit = gridID.split("*");
                var len = gridIDSplit[2].length;
                var dynamicVizSuffix = gridIDSplit[2].substring((len - 5), (len - 1));		

								
				//To read the data from MSTR Viz
				var rawD = me.dataInterface.getRawData(mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.ROWS_ADV, dataConfig);

				var nodeData = [],
					allDuplicateNodes = [],
					nodes = [],
					links = [];

				for (i = 0; i < rawD.length; i++) 
				{   
										
				nodeData.push({ 
					parentSelectorID: rawD[i].headers[0].attributeSelector.eid,
					parentID: rawD[i].headers[0].name,
					parentDesc: rawD[i].headers[1].name,  
					parentLevel: rawD[i].headers[2].name, 
					parentDPOwner: rawD[i].headers[3].name,
					parentDPStatus: rawD[i].headers[4].name,
					childSelectorID: rawD[i].headers[5].attributeSelector.eid,
					childId: rawD[i].headers[5].name,
					childDesc: rawD[i].headers[6].name, 
					childLevel: rawD[i].headers[7].name,
					childDPOwner: rawD[i].headers[8].name,
					childDPStatus: rawD[i].headers[9].name
					
				});						      
				
				}
									

				for(i=0;i<nodeData.length;i++)
				{
				allDuplicateNodes.push({ 
					id: nodeData[i].parentDesc,
					level: nodeData[i].parentLevel,
					dpowner: nodeData[i].parentDPOwner,
					dpstatus: nodeData[i].parentDPStatus
				});

				allDuplicateNodes.push({ 
					id: nodeData[i].childDesc,
					level: nodeData[i].childLevel,
					dpowner: nodeData[i].childDPOwner,
					dpstatus: nodeData[i].childDPStatus
				});
				}
					
				var distinctByKey = (arr, key) => {
				const seen = new Set();
				return arr.filter(obj => {
					if (seen.has(obj[key])) return false;
					seen.add(obj[key]);
					return true;
				});
				};

				var nodes = distinctByKey(allDuplicateNodes, "id");


				for (i = 0; i < rawD.length; i++) 
				{   
										
				links.push({ 
					source: nodeData[i].parentDesc,
					target: nodeData[i].childDesc
				});						      
				
				}
								
				
								
				//Adding Margin to Viz Area
				var margin = {top: 50, right: 50, bottom: 0, left: 50},
				width = parseInt(me.width,10),
				height = parseInt(me.height,10);

				// Build the HTML string with dynamic IDs
				const html = $("<div style='width:"+width+"px; height:"+height+"px'><div class='ctrl' style='width:"+width+"px;height:50px'><input id='filter-input' placeholder='Highlight search (zooms to matches)...' /> <input id='filter-graph-input' placeholder='Filter graph by node (auto-arrange)...' /> <button id='unset-filter-btn'>Unset Filter /Fit to Screen</button><button id='fit-btn'>Fit to Screen</button> </div> <svg id='svgRoot'> <defs> <marker id='arrow' viewBox='0 -5 10 10' refX='10' refY='0' markerWidth='6' markerHeight='6' orient='auto'> <path d='M0,-5L10,0L0,5' fill='#bbb' /> </marker> </defs> <g id='zoom-container'> <g id='zoom-layer'></g> </g> </svg> <div class='tooltip' id='tooltip'></div> </div>");

				$("#"+gridID).append(html);
				
				// maps & layout params
				const nodeById = {};
				nodes.forEach(n => nodeById[n.id] = n);

				const levelMap = {};
				nodes.forEach(n => {
					if (!levelMap[n.level]) levelMap[n.level] = [];
					levelMap[n.level].push(n);
				});

				const NodeW = 140, NodeH = 54;
				const levelGap = 160, horizontalGap = 180;

				// color by level
				const levelColors = d3.scaleOrdinal()
					.domain(Object.keys(levelMap))
					.range(['#fde68a', '#a5f3fc', '#c4b5fd', '#fbcfe8', '#bbf7d0', '#fca5a5']);

				const svg = d3.select("#svgRoot");
				const zoomContainer = d3.select("#zoom-container");
				const zoomLayer = d3.select("#zoom-layer");
				const tooltip = d3.select("#tooltip");

				let selectedNode = null;
				let zoomBehavior; // store zoom behavior

				// initial layout (compute origX/origY and set node.x/node.y)
				function initialLayout() {
					const width = window.innerWidth;
					Object.entries(levelMap).forEach(([level, group]) => {
					const lvl = +level;
					const y = lvl * levelGap + 60;
					const totalWidth = (group.length - 1) * horizontalGap;
					const startX = width / 2 - totalWidth / 2;
					group.forEach((node, i) => {
						const x = startX + i * horizontalGap;
						const origX = x, origY = y;
						// only set origX/origY once
						if (node.origX == null) node.origX = origX;
						if (node.origY == null) node.origY = origY;
						// if node has no runtime x/y (not moved by user), set to original
						if (node.x == null) node.x = node.origX;
						if (node.y == null) node.y = node.origY;
					});
					});
				}

				// helpers to collect upstream/downstream links recursively
				function getUpstreamLinks(nodeId, collected = [], seen = new Set()) {
					for (const l of links) {
					if (l.target === nodeId && !collected.includes(l)) {
						collected.push(l);
						if (!seen.has(l.source)) { seen.add(l.source); getUpstreamLinks(l.source, collected, seen); }
					}
					}
					return collected;
				}
				function getDownstreamLinks(nodeId, collected = [], seen = new Set()) {
					for (const l of links) {
					if (l.source === nodeId && !collected.includes(l)) {
						collected.push(l);
						if (!seen.has(l.target)) { seen.add(l.target); getDownstreamLinks(l.target, collected, seen); }
					}
					}
					return collected;
				}
				/*

				// layout nodes for a given nodes array (used for filtered compact arrangement)
				function arrangeCompact(nodesToArrange) {
					// group by level
					const grouped = d3.group(nodesToArrange, d => d.level);
					const width = window.innerWidth;
					grouped.forEach((group, level) => {
					const y = (+level) * levelGap + 60;
					const totalWidth = (group.length - 1) * horizontalGap;
					const startX = width / 2 - totalWidth / 2;
					group.forEach((n, i) => {
						n.x = startX + i * horizontalGap;
						n.y = y;
					});
					});
				}
				
				*/
				
				function arrangeCompact(filteredNodes) {
				if (!filteredNodes.length) return;

				// group nodes by level
				const grouped = d3.group(filteredNodes, d => d.level);

				grouped.forEach((nodesAtLevel, lvl) => {
					const y = (+lvl) * levelGap + 60;
					const count = nodesAtLevel.length;
					const totalWidth = count * (NodeW + 40);
					const startX = (window.innerWidth - totalWidth) / 2 + NodeW/2;

					nodesAtLevel.forEach((n, i) => {
					n.x = startX + i * (NodeW + 40);
					n.y = y;
					});
				});
				}

				function wrapText(textEl, text, width) {
				const words = text.split(/\s+/).reverse();
				let line = [];
				let lineNumber = 0;
				const lineHeight = 1.1; // ems
				const y = 0;
				const dy = 0;
				let tspan = textEl.text(null)
					.append("tspan")
					.attr("x", 0)
					.attr("y", y)
					.attr("dy", dy + "em");

				let word;
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = textEl.append("tspan")
						.attr("x", 0)
						.attr("y", y)
						.attr("dy", ++lineNumber * lineHeight + dy + "em")
						.text(word);
					}
				}
				}



				// main draw function (draws nodes/links based on nodes array and links array passed)
				function renderGraph(renderNodes = nodes, renderLinks = links, opts = {}) {
					// opts: { animateRestore: boolean } optional

					// remove previous content
					zoomLayer.selectAll("*").remove();

					// draw links
					const linkSel = zoomLayer.selectAll(".link")
					.data(renderLinks, d => `${d.source}→${d.target}`)
					.enter()
					.append("line")
					.attr("class","link")
					.attr("stroke-linecap","round")
					.attr("x1", d => nodeById[d.source].x)
					.attr("y1", d => nodeById[d.source].y + NodeH/2)
					.attr("x2", d => nodeById[d.target].x)
					.attr("y2", d => nodeById[d.target].y - NodeH/2);

					// draw nodes
					const nodeSel = zoomLayer.selectAll(".node")
					.data(renderNodes, d => d.id)
					.enter()
					.append("g")
					.attr("class","node")
					.attr("transform", d => `translate(${d.x},${d.y})`)
					.style("cursor","move");

					nodeSel.append("rect")
					.attr("x",-NodeW/2).attr("y",-NodeH/2)
					.attr("width", NodeW).attr("height", NodeH)
					.attr("fill", d => levelColors(d.level));

					nodeSel.append("text")
					.attr("text-anchor","middle")
					.attr("dy", "0.35em")
				.attr("y", 0)
				.each(function(d) {
					const textEl = d3.select(this);
					const maxWidth = NodeW - 20;
					const maxHeight = NodeH - 10;
					let fontSize = 13;
					textEl.style("font-size", fontSize + "px");
					wrapText(textEl, d.id, maxWidth);

					// --- auto shrink if still doesn't fit ---
					while (true) {
					const bbox = this.getBBox();
					if (bbox.width <= maxWidth && bbox.height <= maxHeight) break;
					fontSize -= 1;
					if (fontSize < 8) break; // stop at min size
					textEl.style("font-size", fontSize + "px");
					textEl.selectAll("tspan").remove();
					wrapText(textEl, d.id, maxWidth);
					}

					// --- re-center vertically ---
					const finalBox = this.getBBox();
					textEl.attr("y", -(finalBox.height / 2) + 6);
				});

					nodeSel.append("circle")
					.attr("class","status-circle")
					.attr("r",7)
					.attr("cx", NodeW/2 - 10)
					.attr("cy", -NodeH/2 + 10)
					.attr("fill", d => d.dpstatus === 'completed' ? '#28a745' : (d.dpstatus === 'in-progress' ? '#ffc107' : '#cfcfcf'));

					// drag: update node.x/node.y & update links in real time
					nodeSel.call(d3.drag()
					.on("start", function(event){ d3.select(this).raise(); })
					.on("drag", function(event,d){
						d.x = event.x; d.y = event.y;
						d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
						// update linked lines
						zoomLayer.selectAll(".link")
						.attr("x1", l => nodeById[l.source].x)
						.attr("y1", l => nodeById[l.source].y + NodeH/2)
						.attr("x2", l => nodeById[l.target].x)
						.attr("y2", l => nodeById[l.target].y - NodeH/2);
					})
					);

					// hover (temporary preview)
					nodeSel.on("mouseover", function(event, d){
					if (selectedNode) return;
					const downLinks = getDownstreamLinks(d.id);
					const upLinks = getUpstreamLinks(d.id);
					const upNodes = new Set(upLinks.flatMap(l => [l.source,l.target]));
					const downNodes = new Set(downLinks.flatMap(l => [l.source,l.target]));
					d3.selectAll(".node").classed("node-upstream", n => upNodes.has(n.id)).classed("node-downstream", n => downNodes.has(n.id));
					d3.selectAll(".link").classed("link-upstream", l => upLinks.includes(l)).classed("link-downstream", l => downLinks.includes(l));
					tooltip.style("display","block").style("left",(event.pageX - 120)+"px").style("top",(event.pageY - 50)+"px")
						.html(`<strong>${d.id}</strong><br> Owner: ${d.dpowner}<hr>
							<div style="color:#0af"><strong>Upstream</strong></div>
							${ upLinks.length ? upLinks.map(l=>`${l.source} → ${l.target}`).join("<br>") : "<div style='opacity:0.8'>None</div>" }
							<div style="margin-top:8px;color:#0f0"><strong>Downstream</strong></div>
							${ downLinks.length ? downLinks.map(l=>`${l.source} → ${l.target}`).join("<br>") : "<div style='opacity:0.8'>None</div>" }`);
					});
					nodeSel.on("mouseout", function(){ if(selectedNode) return; clearHighlights(); tooltip.style("display","none"); });

					// click to toggle persistent highlight & zoom to path
					nodeSel.on("click", function(event,d){
					event.stopPropagation();
					if (selectedNode && selectedNode.id === d.id) { selectedNode = null; clearHighlights(); return; }
					selectedNode = d;
					clearHighlights();
					const up = getUpstreamLinks(d.id);
					const down = getDownstreamLinks(d.id);
					const upIds = new Set(up.flatMap(l => [l.source,l.target]));
					const downIds = new Set(down.flatMap(l => [l.source,l.target]));
					d3.selectAll(".node").classed("node-upstream", n => upIds.has(n.id)).classed("node-downstream", n => downIds.has(n.id));
					d3.selectAll(".link").classed("link-upstream", l => up.includes(l)).classed("link-downstream", l => down.includes(l));
					const allIds = new Set([...upIds, ...downIds, d.id]);
					zoomToNodes(Array.from(allIds).map(id => nodeById[id]));
					});

					// background click clears selection
					svg.on("click", ()=>{ selectedNode = null; clearHighlights(); });

					// define zoom behavior (once)
					if (!zoomBehavior) {
					zoomBehavior = d3.zoom().scaleExtent([0.25, 3]).on("zoom", (e) => zoomContainer.attr("transform", e.transform));
					svg.call(zoomBehavior);
					}

					// expose selections for other handlers
					// (we'll use zoomLayer.selectAll when needed)
				} // end renderGraph

				function clearHighlights() {
					d3.selectAll(".node").classed("node-upstream node-downstream highlight", false);
					d3.selectAll(".link").classed("link-upstream link-downstream link-highlight", false);
				}

				// fit current layer contents to screen
				function fitToScreen() {
					const b = zoomLayer.node().getBBox();
					const fullW = window.innerWidth, fullH = window.innerHeight;
					const bw = Math.max(b.width, 10), bh = Math.max(b.height, 10);
					const scale = 0.9 / Math.max(bw / fullW, bh / fullH);
					const tx = fullW / 2 - scale * (b.x + b.width / 2);
					const ty = fullH / 2 - scale * (b.y + b.height / 2);
					svg.transition().duration(700).call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
				}

				// zoom to a set of nodes
				function zoomToNodes(nodesArr) {
					if (!nodesArr || nodesArr.length === 0) return;
					const xs = nodesArr.map(n => n.x), ys = nodesArr.map(n => n.y);
					const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
					const pad = 80;
					const bounds = { x: minX - pad, y: minY - pad, width: (maxX - minX) + pad * 2, height: (maxY - minY) + pad * 2 };
					const fullW = window.innerWidth, fullH = window.innerHeight;
					const bw = Math.max(bounds.width, 10), bh = Math.max(bounds.height, 10);
					const scale = 0.85 / Math.max(bw / fullW, bh / fullH);
					const tx = fullW / 2 - scale * (bounds.x + bounds.width / 2);
					const ty = fullH / 2 - scale * (bounds.y + bounds.height / 2);
					svg.transition().duration(700).call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
				}

				// INITIALIZE: compute original layout and render
				initialLayout();
				renderGraph();
				fitToScreen();

				// -- Search (highlight + zoom to matches) --
				document.getElementById("filter-input").addEventListener("input", e => {
					const q = (e.target.value || "").trim().toLowerCase();
					// clear previous highlights
					d3.selectAll(".node").classed("highlight", false);
					d3.selectAll(".link").classed("link-highlight", false);
					if (!q) return;
					const matched = [];
					zoomLayer.selectAll(".node").each(function(d) {
					if (d.id.toLowerCase().includes(q)) {
						d3.select(this).classed("highlight", true);
						matched.push(d);
					}
					});
					// highlight adjacent links
					matched.forEach(n => {
					links.forEach(l => {
						if (l.source === n.id || l.target === n.id) zoomLayer.selectAll(".link").filter(x => x === l).classed("link-highlight", true);
					});
					});
					if (matched.length) zoomToNodes(matched);
				});

				// -- Filter graph: show only target node + upstream + downstream (auto-arrange visible nodes) --
				const filterInput = document.getElementById("filter-graph-input");
				filterInput.addEventListener("input", e => {
				const q = (e.target.value || "").trim().toLowerCase();
				if (!q) return;

				// find ALL matching nodes
				const targets = nodes.filter(n => n.id.toLowerCase().includes(q));
				if (!targets.length) return;

				// collect all upstream & downstream links from all matches
				let visibleLinks = [];
				targets.forEach(t => {
					visibleLinks = visibleLinks
					.concat(getUpstreamLinks(t.id))
					.concat(getDownstreamLinks(t.id));
				});

				// make unique
				visibleLinks = Array.from(new Set(visibleLinks));

				// collect visible node IDs
				const visibleIds = new Set(visibleLinks.flatMap(l => [l.source, l.target]));
				targets.forEach(t => visibleIds.add(t.id));

				const visibleNodes = nodes.filter(n => visibleIds.has(n.id));

				// Arrange compactly only visible nodes
				arrangeCompact(visibleNodes, visibleLinks);

				// Render only filtered subgraph
				renderGraph(visibleNodes, visibleLinks);

				// Fit to screen after small delay
				setTimeout(() => fitToScreen(), 120);
				});


				// Unset filter: restore original positions from origX/origY and redraw with animation
				document.getElementById("unset-filter-btn").addEventListener("click", () => {
					// restore positions for all nodes to original stored positions
					nodes.forEach(n => { n.x = n.origX; n.y = n.origY; });
					// redraw full graph
					renderGraph();
					// animate nodes from current (some may be hidden before) to original location -> we simply transition links and nodes by re-rendering
					// After render, fit to screen
					setTimeout(() => { fitToScreen(); }, 120);
					// clear filter input
					filterInput.value = "";
				});

				// Fit button
				document.getElementById("fit-btn").addEventListener("click", () => { renderGraph(); fitToScreen(); });

				// window resize: preserve user moves, but recompute orig positions baseline then re-render
				window.addEventListener("resize", () => {
					// recompute orig positions only for nodes who haven't been manually dragged (we treat orig as baseline)
					Object.entries(levelMap).forEach(([level, group]) => {
					const lvl = +level;
					const y = lvl * levelGap + 60;
					const totalWidth = (group.length - 1) * horizontalGap;
					const startX = window.innerWidth / 2 - totalWidth / 2;
					group.forEach((n, i) => {
						const newOrigX = startX + i * horizontalGap;
						const newOrigY = y;
						// update orig positions (so unset-filter arranges to new viewport)
						n.origX = newOrigX;
						n.origY = newOrigY;
						// If node hasn't been moved by user (x equals old orig), update node.x to new orig
						if (Math.abs((n.x || 0) - newOrigX) < 1 && Math.abs((n.y || 0) - newOrigY) < 1) {
						n.x = newOrigX; n.y = newOrigY;
						}
					});
					});
					renderGraph();
					fitToScreen();
				});


				
				



}})}());
//@ sourceURL=VerticalNodeHierarchy.js
//Developed by Amit Kumar Sah - amitkumars954@gmail.com