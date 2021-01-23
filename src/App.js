import React, { Component } from 'react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import isEqual from 'lodash.isequal';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const cellClassRules = {
  highlight: params => {

    const { colDef, rowIndex, context: { highlight } = {} } = params;

    return highlight.colId === colDef.colId && highlight.rowIndex ===  rowIndex;

    if (highlight.colId !== undefined && highlight.rowIndex !== undefined) {
      return (highlight.colId === 'rowName' || colDef.colId === highlight.colId) &&
        rowIndex === highlight.rowIndex;
    }

    if (highlight.colId !== undefined) {
      return highlight.colId === colDef.colId;
    }

    if (highlight.rowIndex !== undefined) {
      return highlight.rowIndex === rowIndex;
    }
  },
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columnDefs: [
        {
          field: 'athlete',
          colId: 'athlete'
        },
        {
          field: 'age',
          colId: 'age',
          maxWidth: 90,
          valueParser: numberParser
        },
        {
          field: 'country',
          colId: 'country'
        },
        {
          field: 'year',
          colId: 'year',
          maxWidth: 90,
          valueParser: numberParser
        },
        {
          field: 'date',
          colId: 'date'
        },
        {
          field: 'sport',
          coldId: 'sport'
        },
        {
          field: 'gold',
          colId: 'gold',
          valueParser: numberParser
        },
        {
          field: 'silver',
          colId: 'silver',
          valueParser: numberParser
        },
        {
          field: 'bronze',
          colId: 'bronze',
          valueParser: numberParser
        },
      ],
      defaultColDef: {
        flex: 1,
        minWidth: 150,
        editable: true,
        cellClassRules
      },
      rowData: null,
      highlight: {}
    };
  }

  refreshGrid = () =>  {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.refreshCells();
  }

  onCellMouseOver = (ev) => {
    const { colDef: { colId }, rowIndex, data } = ev;
    if (colId === 'rowName') {
      this.setHighlight({ rowIndex, data });
    } else {
      this.setHighlight({ colId, rowIndex, data });
    }
  }

  onCellMouseOut = (ev) => {
    const { colDef: { colId }, rowIndex } = ev;

    // ensure we clear the correct highlight as mouseover on the next cell may
    // have been called before mouseout on the previous cell in the case of
    // header mouseover (which uses custom header cells)
    const { colId: currentColId, rowIndex: currentRowIndex } = this.state.highlight;
    if ((colId === currentColId || currentColId === undefined) && rowIndex === currentRowIndex) {
      this.clearHighlight();
    }
  }

  setHighlight  = (highlight) => {
    if (isEqual(this.state.highlight, highlight)) {
      return;
    }

    this.setState({ highlight }, this.refreshGrid);
  }

  clearHighlight() {
    this.setState({ highlight: {}, contextMenuTarget: {} }, this.refreshGrid);
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    const httpRequest = new XMLHttpRequest();
    const updateData = (data) => {
      this.setState({ rowData: data });
    };

    httpRequest.open(
      'GET',
      'https://www.ag-grid.com/example-assets/olympic-winners.json'
    );
    httpRequest.send();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        updateData(JSON.parse(httpRequest.responseText));
      }
    };
  };

  render() {
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <div
          id="myGrid"
          style={{
            height: '100%',
            width: '100%',
          }}
          className="ag-theme-alpine"
        >
          <AgGridReact
            columnDefs={this.state.columnDefs}
            defaultColDef={this.state.defaultColDef}
            onGridReady={this.onGridReady}
            rowData={this.state.rowData}
            context={{ highlight: this.state.highlight }}
            onCellMouseOver={this.onCellMouseOver}
            onCellMouseOut={this.onCellMouseOut}
          />
        </div>
      </div>
    );
  }
}

function cellStyle(params) {
  var color = numberToColor(params.value);
  return { backgroundColor: color };
}
function cellClass(params) {
  return params.value === 'Swimming' ? 'rag-green' : 'rag-amber';
}
function numberToColor(val) {
  if (val === 0) {
    return '#ffaaaa';
  } else if (val === 1) {
    return '#aaaaff';
  } else {
    return '#aaffaa';
  }
}
function ragRenderer(params) {
  return '<span class="rag-element">' + params.value + '</span>';
}
function numberParser(params) {
  var newValue = params.newValue;
  var valueAsNumber;
  if (newValue === null || newValue === undefined || newValue === '') {
    valueAsNumber = null;
  } else {
    valueAsNumber = parseFloat(params.newValue);
  }
  return valueAsNumber;
}


export default App;
