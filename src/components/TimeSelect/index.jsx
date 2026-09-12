import { useState } from 'react';
import { connect } from 'react-redux';
import dayjs from 'dayjs';

import { Button, Divider, Modal, Paper, Typography, withStyles } from '@material-ui/core';

import Colors from '../../colors';
import { selectTimeFilter } from '../../actions';

const styles = (theme) => ({
  cancelButton: {
    backgroundColor: Colors.grey200,
    color: Colors.white,
    '&:hover': {
      backgroundColor: Colors.grey400,
    },
  },
  saveButton: {
    backgroundColor: Colors.white,
    color: Colors.grey800,
    '&:hover': {
      backgroundColor: Colors.white70,
    },
  },
});

const TimeSelect = ({ classes, onClose, filter, dispatch }) => {
  const [start, setStart] = useState(dayjs(filter.start).format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs(filter.end).format('YYYY-MM-DD'));

  const changeStart = (event) => {
    if (event.target.value) {
      setStart(event.target.value);
      setEnd(current => (
        current < event.target.value ? event.target.value : current
      ));
    }
  };

  const changeEnd = (event) => {
    if (event.target.value) {
      setEnd(event.target.value < start ? start : event.target.value);
    }
  };

  const handleSave = () => {
    dispatch(selectTimeFilter(
      dayjs(start).startOf('day').valueOf(),
      dayjs(end).endOf('day').valueOf(),
    ));
    onClose();
  };

  const minDate = dayjs().subtract(365, 'day').format('YYYY-MM-DD');
  const maxDate = dayjs().format('YYYY-MM-DD');

  return (
    <Modal
      open
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <Paper className="w-84 max-w-sm p-4 outline-none">
        <div className="flex justify-between mb-5">
          <div className="flex w-34 flex-col gap-1.5">
            <Typography variant="body2">Start date:</Typography>
            <input
              className="w-full box-border"
              type="date"
              min={minDate}
              max={maxDate}
              onChange={changeStart}
              value={start}
            />
          </div>
          <div className="flex w-34 flex-col gap-1.5">
            <Typography variant="body2">End date:</Typography>
            <input
              className="w-full box-border"
              type="date"
              min={start}
              max={maxDate}
              onChange={changeEnd}
              value={end}
            />
          </div>
        </div>
        <Divider />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="contained" className={classes.cancelButton} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" className={classes.saveButton} onClick={handleSave}>
            Save
          </Button>
        </div>
      </Paper>
    </Modal>
  );
};

const stateToProps = (state) => ({
  filter: state.filter,
});

export default connect(stateToProps)(withStyles(styles)(TimeSelect));
