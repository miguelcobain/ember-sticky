import Ember from 'ember';

const assign = Ember.assign || Ember.merge;

const defaultOffsets = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0
};

export default function isInViewport(boundingClientRect = {}, height = 0, width = 0, offsets = defaultOffsets) {
  const { top, left, bottom, right } = boundingClientRect;
  const finalOffsets = assign({}, defaultOffsets, offsets);
  const {
    top: topOffset,
    left: leftOffset,
    bottom: bottomOffset,
    right: rightOffset
  } = finalOffsets;

  return (
    (top - topOffset)       >= 0 &&
    (left - leftOffset)     >= 0 &&
    (bottom + bottomOffset) <= height &&
    (right + rightOffset)   <= width
  );
}